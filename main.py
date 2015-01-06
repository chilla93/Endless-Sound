#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License
#
# Just taking flask as an example



import os
import webapp2
import urllib
import urllib2
import jinja2
import json
import random

import simplecache

from datetime import datetime as dt


from google.appengine.ext import db
from google.appengine.api import urlfetch
from google.appengine.api import memcache




JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.join(
        os.path.dirname(__file__), 'templates')),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

def render_str(template, **params):
    t = JINJA_ENVIRONMENT.get_template(template)
    return t.render(params)

class MainHandler(webapp2.RequestHandler):
    def write(self, *a, **kw):
        self.response.out.write(*a, **kw)

    def render_str(self, template, **params):
        return render_str(template, **params)

    def render(self, template, **kw):
        self.write(self.render_str(template, **kw))

class User(db.Model):
    username = db.StringProperty(required = True)
    imagesource = db.StringProperty(required = True)
    permalink = db.StringProperty(required = True)
    user_id = db.StringProperty(required = True)    
    created = db.DateTimeProperty(auto_now_add = True)
    last_modified = db.DateTimeProperty(auto_now = True)
    

class Track(db.Model):
    title = db.StringProperty(required = True)
    track_id = db.StringProperty(required = True)
    imagesource = db.StringProperty(required = True)
    waveform = db.StringProperty(required = True)
    permalink = db.StringProperty(required = True)
    playback_count = db.StringProperty(required = True)
    favoritings_count = db.StringProperty(required = True)
    created = db.DateTimeProperty(auto_now_add = True)
    last_modified = db.DateTimeProperty(auto_now = True)

class DictModel(db.Model):
    def to_dict(self):
       return dict([(p, unicode(getattr(self, p))) for p in self.properties()])

#cache handler
def cache_data(track_id, track, duration):
    data = memcache.get(track_id)
    if data is not None:
        return data
    else:
        memcache.add(track_id, track, duration)
        return track

def overwrite_cache_data(track_id, track, duration):
    data = memcache.get(track_id)
    if data is not None:
        memcache.set(track_id, track, duration)
    else:
        memcache.add(track_id, track, duration)
    return track
    
def add_tracks():
        users = db.GqlQuery("select * from User")
        users = list(users)
        randuser = random.choice(users)
        kind = ['tracks', 'favorites']
        tracks = []
        duration = 0
        imagesource = None
        check = None
        playback = "--"
        trackduration = 601
        limit = "10"
        offset = random.randint(0, 10)
        lasttrackid = ""
        

        #check if the memcache has a listing. adds the total duration of the tracks in the current list.
        c = memcache.get("list", namespace=None)
        if c is not None:
            if len(c) > 0:
              lasttrackid = c[-1]['track_id']
              for track in c:
                duration += int(track['duration'])
        else:
            c = []

        #while imagesource is None and trackduration > 600:
        while check is None:
         #while imagesource is None:
          for i in kind:
             response = urllib.urlopen('http://api.soundcloud.com/users/%s/%s.json?limit=%s&offset=%s&filter=streamable&client_id=6f8c3d888d377485e5efdd8628a9840d' % (randuser.user_id,i, limit, offset))
             tracks = json.loads(response.read())
             if len(tracks) > 0:
                break
          tracks = random.sample(tracks, 1)
          imagesource = tracks[0]['artwork_url']
          trackduration = int(tracks[0]['duration']/1000)
          if trackduration < 100 or trackduration > 600:
              trackduration = None
          if imagesource is not None and trackduration is not None and lasttrackid != str(tracks[0]['id']):
              check = 'yes'              

          #try:
             #playback = tracks[0]['playback_count']
          #except KeyError, e:
             #playback = 'default'
        
        b = []

        for track in tracks:
            #return track['artwork_url'], track['playback_count']
            #a = Track(title = track['title'], track_id = str(track['id']), imagesource = track['artwork_url'], waveform = track['waveform_url'],
                       #permalink = track['permalink'], playback_count = str(track['playback_count']), favoritings_count = str(track['favoritings_count']))
            duration += int(track['duration']/1000)
            #.........checking for errors........
            imagesource = track['artwork_url']
            #playback = track['playback_count']
            #....................................
            track.setdefault('favoritings_count',playback)
            track.setdefault('playback_count',playback)
            obj = {
            'title': track['title'],
            'track_id': str(track['id']),
            'imagesource': track['artwork_url'],
            'permalink': track['permalink'],
            'username': track['user']['username'],
            'playback_count': str(track['playback_count']),
            'waveform': track['waveform_url'],
            'favoritings_count': str(track['favoritings_count']),
            'duration': int(track['duration'])/1000
            } 
            c.append(obj)
            b = obj
        
        c = overwrite_cache_data("list", c, duration)
        return b
        
class PostPage(MainHandler):
    def get(self):             
        self.render('base.html')
        
    def post(self):
        userName = self.request.get('userName')
        imageSource = self.request.get('imageSource')
        permalink = self.request.get('permalink')
        userId = self.request.get('userId')
        response = ""
        returnval = ""

        users = db.GqlQuery("select * from User where user_id = :1", str(userId))
        for user in users:
            returnval = user.user_id

        if userName and imageSource and permalink and userId:
           if returnval == userId:
               response = userName + " is already present in the database"
           else:
               p = User(username = userName, imagesource = imageSource, permalink = permalink, user_id = userId )
               p.put()            

               response = userName + " has been uploaded to the database"

        else:
           response = "there was an error sending the user information to the database"  
        
        self.response.headers['Content-Type'] = 'application/json'   
        obj = {
            'userName': userName,
            'imageSource': imageSource,
            'permalink': permalink,
            'userId': userId,

            'response': response,
            'returned_id': returnval,            
          } 
        self.response.out.write(json.dumps(obj))

class MainPage(MainHandler):
    def get(self):
        number = '14514906'
        user = db.GqlQuery("select * from User where user_id = :1", number)
        self.render('post.html', user = user)

class TrackPage(MainHandler):
    def get(self):
        c = memcache.get("list", namespace=None)

        if c is None or len(c) == 0:
            c = []
            for x in xrange(2):
             c.append(add_tracks())
        


        #c = memcache.get("list", namespace=None)

        #self.response.out.write(json.dumps(c, default=lambda o: o.__dict__))
        self.response.out.write(json.dumps(c))

    def post(self):
        track_id = self.request.get('id')
        action = self.request.get('action')
        duration = 0
        

        c = memcache.get("list", namespace=None)
        
        
        #while c[0]['track_id'] != track_id:  to remember the syntax

        if action == "remove" and c is not None:
           if c[0]['track_id'] == track_id:
               c.remove(c[0])
               for track in c:
                   duration+=track['duration']
               c = overwrite_cache_data("list", c, duration)
               
        elif action == "add" and track_id == "moresong":
             c = []
             for x in xrange(2):
              c.append(add_tracks())
            
        elif action == "add" and c is not None:
            if len(c) > 0:
             if c[0]['track_id'] == track_id:
                if len(c) == 1:
                  c = []
                  for x in xrange(2):
                   c.append(add_tracks())
                else:
                  c.pop(0)

        elif action == "add" and c is None:
             c = []
             for x in xrange(2):
              c.append(add_tracks())

        self.response.out.write(json.dumps(c))
class TestOutput(MainHandler):
    def get(self):
        output = "code is working"
        c = memcache.get("list", namespace=None)
        c = list(c)
        if len(c) == 1:
            output = "code is not working"
        else:
            c.pop(0)
            output = c
        self.response.out.write(len(c))
        self.response.out.write(output)
            
class TestPage(MainHandler):
    def get(self):
        #c = simplecache.cache_genre("house", 3600)
        users = db.GqlQuery("select * from User")
        users = list(users)
        randuser = random.choice(users)
            
        self.response.out.write(randuser.user_id)
        
app = webapp2.WSGIApplication([
    ('/', MainPage),
    ('/post', PostPage),
    ('/tracks', TrackPage),
    ('/testpage', TestPage),
    ('/testoutput',TestOutput),
], debug=True)
