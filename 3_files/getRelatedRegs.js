//When user clicks on the related regs icon on the by titles page, this will populate/display the list.
function getRegs(id, actLink) {
	//Get the popup to be populated/displayed
	popupSpan = $("#"+id);
	
	//Get the waiting gif div to be enabled
	waitingGIF = $("."+id);
	
	//Related regs headings for english
	var relatedListHeading = "<h2 class='relatedRegsHeading'>Regulations made under this Act</h2>";
	var repealedRelatedListHeading = "<h2 class='repealedRegsHeading'>Repealed regulations made under this Act</h2>";
	
	//Related regs headings for french
	if (id.includes("F") ==  true) {
		relatedListHeading = "<h2 class='relatedRegsHeading relatedInfo'>R&#232;glements pris en vertu de cette loi</h2>";
		repealedRelatedListHeading = "<h2 class='repealedRegsHeading relatedInfo'>R&#232;glements abrog&#233;s pris en vertu de cette loi</h2>";
	}
	
	//if visible, hide
	if ($("#"+id).css('display') == 'none') {
		
		//Enable waiting GIF
		waitingGIF.addClass("loading");
		
		//Ajax makes call to api to get related regs
		//If success, create a list and toggle the list on the site
		$.ajax({
			type: 'GET',
			url: 'https://laws-lois-api.justice.gc.ca/acts/' + id + '/regulations',
			dataType: 'JSON',
			success: function(data){
								
				//Clear the content in the span
				popupSpan.empty();
				
				var regsArray = [];
				var regsRepealedArray = [];
				//Build array of related regs with anchors using api
				$(data.value).each(function(i, v){
					
					//Set and build the anchor tag 
					var sTitle = v.short_title;
					var sAlpha = v.alpha;
					var regLink = v.web_page_index;
					
					var regAnchor = "";
					if (v.repealed == "true"){
						//Build anchor and add to array for repealed regs
						regAnchor = "<a href='" + regLink + "' class='regListRepealed'>" + sTitle + " (" +  sAlpha + ")</a>";
						regsRepealedArray.push([sTitle, regAnchor]);
					}else{
						//Build anchor and add to array
						regAnchor = "<a href='" + regLink + "'>" + sTitle + " (" +  sAlpha + ")</a>";
						regsArray.push([sTitle, regAnchor]);
					}
				});
				
				//Sort the array for french characters
				regsArray.sort((a,b) => a[0].localeCompare(b[0], 'fr-CA'));
				regsRepealedArray.sort((a,b) => a[0].localeCompare(b[0], 'fr-CA'));
				
				var list = "";
				//Build list of related regs for dropdown
				if (regsArray.length != 0) {
					var list = relatedListHeading;
					list += "<ul>";
					for (const reg of regsArray){
						list += ("<li>" + reg[1] + "</li>");
					}
					list += "</ul>";
				}else{
					repealedRelatedListHeading = repealedRelatedListHeading.replace("repealedRegsHeading", "repealedRegsHeading0");
				}
								
				//Build list of repealed related regs for dropdown
				if (regsRepealedArray.length != 0) {
					list += repealedRelatedListHeading;
					list += "<ul class='repealedList'>";
					for (const reg of regsRepealedArray){
						list += ("<li>" + reg[1] + "</li>");
					}
					list += "</ul>";
				}
				
				//Disable waiting GIF
				waitingGIF.removeClass("loading");
				
				//Add the list to html page
				popupSpan.append(list);
				
				//Show the related regs list
				popupSpan.slideDown("slow");
			},
			error: function (xhr, textStatus, errorThrown) { 
				//alert(xhr.reponseText + " " + xhr.status);
				
				//Disable waiting GIF
				waitingGIF.removeClass("loading");
				
				//If API is down, redirect to related regs list
				location.href = actLink;
			}
		});
	}else{
		//Hide the related regs list
		popupSpan.slideUp("slow");
	}
}

//If javascript is enabled, this will change the href to a onclick method.
$(document).ready(function () {
	
	//Iterates through html to get the popuptext span element
	$("li .popuptext").each(function() {
		
		//Get the id from the popuptext for referencing
		var id = $(this).attr("id");
		
		//Get the related regs anchor to use if the Laws API server goes down
		var actLink = $(this).parent().children().children().attr("href");
		actLink += "/#r3lR3g";
		
		//Remote the href attribute, and add the onglick attribute with id and actlink
		$(this).siblings().find(".rButtonShowRegList").removeAttr("href");
		$(this).siblings().find(".rButtonShowRegList").attr("onclick", "getRegs('" + id + "',\""+ actLink +"\")");		
	});
});