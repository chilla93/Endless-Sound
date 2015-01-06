musicbutton = document.getElementById("musicbutton");
tracklist = document.getElementById("tracklist");

// console.log(tracklist.childNodes.length, "HEEEEYYY");

/*............GET TRACKS FROM MEMCACHE................*/
$.getJSON("/tracks",{kind: "list"}, function(data){
        console.log(data);
        var more = "moresong";
        // console.log(data.length, data[0])
        for(i=0; i<data.length; i++){
          createListElement(data[i].track_id, data[i].title, data[i].imagesource, data[i].username);
        }

        if (data.length == 1){
          addNewSong(more);
        }

        // console.log(tracklist.childNodes.length, "HEEEEYYY");

        soundsetup();        
    });
/*..................................................*/



function createListElement(track_id, trackname, imagesource, username){
  
  /*.............create span elements......*/
  var li1 = document.createElement("li");
  var outerdiv = document.createElement("div");
  var img = document.createElement("img");
  var span1 = document.createElement("div");
  var divname = document.createElement("div");
  var divtitle = document.createElement("div");
  /*.............write to span elements......*/
  imagesource = imagesource.replace("large","t500x500");
  img.src = imagesource;
  outerdiv.appendChild(img);
  outerdiv.className = "outerdiv";
  /*....................*/
  divname.className = "title";
  divname.innerHTML = trackname;
  divtitle.className = "name";
  divtitle.innerHTML = username;

  span1.appendChild(divname);
  span1.appendChild(divtitle);


  li1.className = "trackItem";
  li1.id = track_id;
  // li1.innerHTML = trackname;
  li1.appendChild(outerdiv);
  li1.appendChild(span1);
  /*.....append to div............*/
  //tracklist.appendChild(li1);
  $(li1).hide().appendTo("#tracklist").fadeIn("slow");

  }

function soundsetup(){
  soundManager.setup({
    url: '/swf/',
    useHighPerformance : true,
    onready: function() {
      console.log("READY");
      createSoundObject(document.getElementById("tracklist").childNodes[1].id);
      musicbutton.className = "pauseButton";
    },
    ontimeout: function() {
    // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?  
       // Something went wrong during init - in this example, we *assume* flashblock etc.
      soundManager.flashLoadTimeout = 0; // When restarting, wait indefinitely for flash
      soundManager.onerror = {}; // Prevent an infinite loop, in case it's not flashblock
      soundManager.reboot(); // and, go!
     }



	});
}

	function createSoundObject(track){
	  mySound = soundManager.createSound({
      id: track,
      url: 'https://api.soundcloud.com/tracks/'+ track + '/stream?client_id=6f8c3d888d377485e5efdd8628a9840d',
      volume: 0,
      onplay: function(){

          console.log("LEGGO!");
          soundFadeIn(track);
          console.log();


          var mainSong = document.getElementById(track);
          console.log(mainSong.childNodes[0].childNodes[0].src);
          changeMainSong(track);

      },

      onfinish: function(){
    //     if (document.getElementById(track).nextSibling.nextSibling){
    //    var next = document.getElementById(track).nextSibling.nextSibling.id;
    //    createSoundObject(next);
    // }
        var next = "last";
        if($('#tracklist').children().length > 1){
        next = document.getElementById(track).nextSibling.id;
      }
      
        this.destruct();
        
        removeSong(track);
        
        setTimeout(function(){
          tracklist.removeChild(document.getElementById(track)); 
        }, 2000);

        setTimeout(function(){ 
          addNewSong(next); 
          
        }, 3000);

      },
    });

    mySound.play();
    
    mySound.load({

    onload: function() {     
             
    // setTimeout(function(){ $(firstelement).hide(), 6000 });

    this.onPosition(this.duration - 36000, function(eventPosition) {

      firstelement = "#" + this.id;
    // console.log(document.getElementById(track).nextSibling, "HIIII")
    $(firstelement).animate({"opacity":"0"},6000, function() {

   });
    setTimeout(function(){ 
      $(".trackItem").animate({"left":"-=220"}, 2000);
    }, 6000);

    setTimeout(function(){
      $(firstelement).hide();
      $(".trackItem").animate({ "left" : "+=220" }, 0);
    }, 8200);
      // console.log("DONE!");
      // console.log(document.getElementById(track).nextSibling.nextSibling)

      // setTimeout(function(){ $(".collection").animate({"left":"-=150"}, 10000), 10000  });

      //$(removeId).children().animate({"height":"0", "width": "0", "margin-top":"75px"},6000, function() {
     //$(removeId).hide();
   //});

      if (document.getElementById(track).nextSibling){
       var next = document.getElementById(track).nextSibling.id;
       createSoundObject(next);
    }

      soundFadeOut(this.id);
                              });
                        }
                  });

	}
    $("#musicbutton").click(function(){
      if(this.className == "pauseButton"){
    	soundManager.pauseAll();
      this.className = "playButton";  
      }
      else{
      soundManager.resumeAll();
      this.className = "pauseButton";
      } 	
    });

    $('.trackItem').click(function(){
      pauseall();
      createSoundObject(this.id);
      var next = "done with the list, boy!";
    //   if (document.getElementById(this.id).nextSibling.nextSibling){
    //    next = document.getElementById(this.id).nextSibling.nextSibling.id;
    // }

    //   console.log(this, next);
    });

    function pauseall(){
      soundManager.pauseAll();
    }

    function soundFadeIn(soundID){


      var s = soundManager.getSoundById(soundID);

      var vol = s.volume;
      console.log("volume is at " + vol);

      if (vol == 100) return false;

      if(musicbutton.className == 'pauseButton') s.setVolume(Math.min(100,vol+3));


      setTimeout(function(){soundFadeIn(soundID)}, 1000);
    }

    function soundFadeOut(soundID){
      var s = soundManager.getSoundById(soundID);

      var vol = s.volume;
      console.log("volume is at " + vol);

      if (vol == 0) return false;

      if(musicbutton.className == 'pauseButton') s.setVolume(Math.max(0,vol-3));

      setTimeout(function(){soundFadeOut(soundID)}, 1000);
    }

    function addNewSong(track_id){
      /*if(tracklist.childNodes.length < 3){
      $.getJSON("/tracks",{id: "list"}, function(data){
        console.log(data);
        // console.log(data.length, data[0])
        for(i=0; i<data.length; i++){
          createListElement(data[i].track_id, data[i].title);
          }     
             
      });
    }*/

if(tracklist.childNodes.length < 3){
  var formData = new FormData();
        /* Add the file */
  formData.append("action", "add");
  formData.append("id", track_id)


    $.ajax({
                type: "POST",
                url: "/tracks",
                dataType: "json",
//                data:  JSON.stringify({title:title.val()}),
                data: formData,
//                data: JSON.stringify(songform.serializeArray()),
//                contentType: "application/json; charset=utf-8",
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data); 
                    for(i=0; i<data.length; i++){
                      createListElement(data[i].track_id, data[i].title, data[i].imagesource, data[i].username);
                    }  
                                  
                },
                error: function(thrownError){
                    console.log(thrownError);
                    setTimeout(function(){addNewSong(track_id)}, 20000);
                }

            });
    }

    }
  
   function removeSong(track_id){
    var removeId = '#' + track_id;
    // var $this = $(removeId);
 
     // $(removeId).fadeOut(1000);
     // setTimeout(function(){ $(".collection").css( "left", "+=150" ); }, 1000);


     
  var formData = new FormData();
        /* Add the file */
  formData.append("action", "remove");
  formData.append("id", track_id)

    $.ajax({
                type: "POST",
                url: "/tracks",
                dataType: "json",
//                data:  JSON.stringify({title:title.val()}),
                data: formData,
//                data: JSON.stringify(songform.serializeArray()),
//                contentType: "application/json; charset=utf-8",
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data);   
                                  
                },
                error: function(thrownError){
                    console.log(thrownError);
                }

            });

    }
function changeMainSong(track_id){
    var mainSong = document.getElementById(track_id);
    //var coverArt = document.getElementById("coverArt");
    var coverArt = $('#coverArt');
    var currentSong = $("#currentSong");
    var currentArtist = $("#currentArtist");

    coverArt.fadeOut(1000, function () {
        coverArt.attr('src', mainSong.childNodes[0].childNodes[0].src).fadeIn('slow');
      });
    currentSong.fadeOut(1000, function () {
        currentSong.html(mainSong.childNodes[1].childNodes[0].innerHTML).fadeIn('slow');
      });
    currentArtist.fadeOut(1000, function () {
        currentArtist.html(mainSong.childNodes[1].childNodes[1].innerHTML).fadeIn('slow');
      });

    // console.log(mainSong.childNodes[1].childNodes[0].innerHTML);

     //coverArt.src = mainSong.childNodes[0].childNodes[0].src;
     // currentSong.innerHTML = mainSong.childNodes[1].childNodes[0].innerHTML;
     // currentArtist.innerHTML = mainSong.childNodes[1].childNodes[1].innerHTML;
}

 // Set up a global AJAX error handler to handle the 401
// unauthorized responses. If a 401 status code comes back, say something
$.ajaxSetup({
            statusCode: {
                401: function(){
 
                    console.log("error!!!!!");
 
                }
            }
        });

