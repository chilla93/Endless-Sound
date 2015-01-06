
searchInput = document.getElementById("linkSearch");
resultList= document.getElementById("resultList");
results = document.getElementById("results");
response = document.getElementById("response");



$('#searchForm').submit(function(event){
  event.preventDefault();
  
  
  SC.initialize({
   client_id: '6f8c3d888d377485e5efdd8628a9840d'
  });
 	// find all sounds of buskers licensed under 'creative commons share alike'
  SC.get('/users', { q: searchInput.value, limit: 10}, function(tracks) {

   // console.log(tracks);
   
   while (resultList.hasChildNodes()) {
    resultList.removeChild(resultList.lastChild);
    }


   for(i=0; i<tracks.length; i++){
   		// console.log(tracks[i]);
   		createListElement(tracks[i].username, tracks[i].permalink_url, tracks[i].id, tracks[i].followers_count, tracks[i].avatar_url);
    }

  });
});

function createListElement(username, permalink_url, itemId, followers_count, avatar_url){
	
	/*.............create span elements......*/
	var span1 = document.createElement("span");
	var span2 = document.createElement("span");
	var detailDiv = document.createElement("div");
	/*.............write to span elements......*/
	span1.className = "itemId";
	span1.innerHTML = itemId;
	span2.className = "followers";
	span2.innerHTML = followers_count;
	/*.....append to div............*/
	detailDiv.className = "itemDetail";
	detailDiv.appendChild(span1);
	detailDiv.appendChild(span2);
	/*.............create div and a elements.....*/
	var nameDiv = document.createElement("div");
	var link = document.createElement("a");
	var contentDiv = document.createElement("div");
	/*......write to elements.......*/
	contentDiv.className = "itemContent";
	nameDiv.className = "itemName";
	nameDiv.innerHTML = username;
	link.className = "permalink";
	link.href = permalink_url;
	link.target = "_blank";
	link.innerHTML = permalink_url;
	/*......append to content div......*/
	contentDiv.appendChild(nameDiv);
	contentDiv.appendChild(link);
	contentDiv.appendChild(detailDiv);
	/*........create image and list element.....*/
	var imageCover = document.createElement("img");
	var resultItem = document.createElement("li");
	avatar_url = avatar_url.replace("large","t500x500");
	imageCover.src = avatar_url;
	imageCover.className = "itemImage";
	resultItem.className="resultItem";
	/*........................append to result item.............*/
	resultItem.appendChild(imageCover);
	resultItem.appendChild(contentDiv);
	resultList.appendChild(resultItem);

}

$(document).on('click', '.resultItem', function() { 

	// console.log(this.childNodes[0].src, this.childNodes[1].childNodes[0].innerHTML, this.childNodes[1].childNodes[1].href,
	// this.childNodes[1].childNodes[2].childNodes[0].innerHTML );

	var formData = new FormData();
        /* Add the file */
        formData.append("imageSource", this.childNodes[0].src);
        formData.append("userName", this.childNodes[1].childNodes[0].innerHTML);
        formData.append("permalink", this.childNodes[1].childNodes[1].href);
        formData.append("userId", this.childNodes[1].childNodes[2].childNodes[0].innerHTML);
        
            $.ajax({
                type: "POST",
                url: "/post",
                dataType: "json",
//                data:  JSON.stringify({title:title.val()}),
                data: formData,
//                data: JSON.stringify(songform.serializeArray()),
//                contentType: "application/json; charset=utf-8",
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data);   
                    response.innerHTML = data.response;              
                },
                error: function(thrownError){
                    console.log(thrownError);
                }

            });
});
