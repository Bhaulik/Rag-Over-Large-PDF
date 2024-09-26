//This script will handle the CSS styles and classes for the Laws site font changer.

//Main function is called once the web page is ready. 
$(document).ready(function () {
// ----------------------------------------------------------------------------------------------FCSelector

	//Defines the divisions for each font-changer selector, English and French are determined by the lang inthe ain html tag.
    //This section adds a div before the (.docContents) division and after the (.lineSeparator).
	if ( $('html').attr('lang') == 'fr' ) {
		$('.docContents').before("<div class='FCSelector'><a href='#' id='doWhite'><abbr title='Contexte et texte par défaut'>Aa</abbr></a>&nbsp;<a href='#' id='doBlack'><abbr title='Fond noir avec Verdana police'>Aa</abbr></a>&nbsp;<a href='#' id='doBlue'><abbr title='Fond bleu avec la police Verdana'>Aa</abbr></a>&nbsp;<a href='#' id='doGrey'><abbr title='Fond gris avec la police Century Gothic'>Aa</abbr></a>&nbsp;<a href='#' id='doYellow'><abbr title='Fond jaune avec la police Comic Sans MS'>Aa</abbr></a></div>");
	} else if ($('html').attr('lang') == 'en') {
		$('.docContents').before("<div class='FCSelector'><a href='#' id='doWhite'><abbr title='Default background and text'>Aa</abbr></a>&nbsp;<a href='#' id='doBlack'><abbr title='Verdana font with black background'>Aa</abbr></a>&nbsp;<a href='#' id='doBlue'><abbr title='Verdana font with blue background'>Aa</abbr></a>&nbsp;<a a href='#' id='doGrey'><abbr title='Century Gothic font with grey background'>Aa</abbr></a>&nbsp;<a a href='#' id='doYellow'><abbr title='Comic Sans MS font with yellow background'>Aa</abbr></a></div>");
	}
	
// ----------------------------------------------------------------------------------------------doWhite

	//Adds clickable functionality to #doWhite span section.
	//This function does the reset of the font changer classes that styles the web page when doWhite selector is clicked.
	$(document).on('click', '#doWhite', function () {

		//Removes the class related to Reader Note border. Resets the border to default styles.
		$('.ReaderNote-doBlack').removeClass('ReaderNote-doBlack').addClass('ReaderNote');
		
		//Removes the class related to blank lines in a form. Bottom borders with a short dotted line. Resets the the border to default styles.
		$('.Leader-dot-doBlack').removeClass('Leader-dot-doBlack').addClass('Leader-dot');
		
		//Removes the class related to blank lines in a form. Bottom borders with a short dashed line. Resets the the border to default styles.
		$('.Leader-dash-doBlack').removeClass('Leader-dash-doBlack').addClass('Leader-dash');
		
		//Removes the class related to blank lines in a form. Bottom borders with a short solid line. Resets the the border to default styles. 
		$('.Leader-solid-doBlack').removeClass('Leader-solid-doBlack').addClass('Leader-solid');
		
		//Removes the classes related to full page styling.
		$('.docContents, .ScheduleRP, .ScheduleNIF').removeClass('doBlack doBlue doGrey doYellow');
		
		//Removes the class related to a dashed separator in Related Provisions. Resets the dashed separator to default styles.
		$('.nifrpCitation-doBlack').removeClass('nifrpCitation-doBlack').addClass('nifrpCitation');
		
		//Removes the classes related to citations/references. Resets the reference styles to defualt styles. 
		$('cite').removeClass('cite-doBlack cite-doBlue cite-doGrey cite-doYellow').addClass('XRefExternalAct');
		
		//Removes the classes related to point in time links. Resets the point in time link styles to default styles.
		$('a').removeClass('PITLink-doBlack PITLink-doBlue PITLink-doGrey PITLink-doYellow').addClass('PITLink');
		
		//Removes the classes related to a small block for quotes. Resets the blockquote to defaul styles.
		$('blockquote').removeClass('blockquote-doBlack blockquote-doBlue blockquote-doGrey blockquote-doYellow');
		
		//Removes the class related to blank lines in a form. Bottom borders with a long dotted line. Resets the the border to default styles. 
		$('.LeaderRightJustified-dot-doBlack').removeClass('LeaderRightJustified-dot-doBlack').addClass('LeaderRightJustified-dot');
		
		//Removes the class related to blank lines in a form. Bottom borders with a long dashed line. Resets the the border to default styles. 
		$('.LeaderRightJustified-dash-doBlack').removeClass('LeaderRightJustified-dash-doBlack').addClass('LeaderRightJustified-dash');
		
		//Removes the class related to blank lines in a form. Bottom borders with a long solid line. Resets the the border to default styles. 
		$('.LeaderRightJustified-solid-doBlack').removeClass('LeaderRightJustified-solid-doBlack').addClass('LeaderRightJustified-solid');
		
		//Removes the class related to nif sectinos that are greyed out. Resets to default styles.
		$('.nif-doBlack, .nif-doBlue, .nif-doGrey, .nif-doYellow').removeClass('nif-doBlack nif-doBlue nif-doGrey nif-doYellow').addClass('nif');
		
		//Removes the classes related to tables. Resets the table hover styling to default styles.
		$('table').removeClass('table-striped-doBlack table-striped-doBlue table-striped-doGrey table-striped-doYellow').addClass('table-hover');
		
		//Removes the classes related to Schedules that have lists. Resets the list hover styling to default styles.
		$('.Schedule-doBlack, .Schedule-doBlue, .Schedule-doGrey, .Schedule-doYellow').removeClass('Schedule-doBlack Schedule-doBlue Schedule-doGrey Schedule-doYellow').addClass('Schedule');
		
		//Removes the class related to Repealed text. Sets the Repealed text to doBlack styling.
		$('.Repealed-doBlack, .Repealed-doBlue, .Repealed-doGrey, .Repealed-doYellow').removeClass('Repealed-doBlack Repealed-doBlue Repealed-doGrey Repealed-doYellow').addClass('Repealed');
		
		//Removes the class related to table borders. Resets the table border to defaul styles.
		$('.topdouble-doBlack, .topdouble-doBlue, .topdouble-doGrey, .topdouble-doYellow').removeClass('topdouble-doBlack topdouble-doBlue topdouble-doGrey topdouble-doYellow').addClass('topdouble');
		
		//Removes the whiteText and blackText classes, which sets the text color back to default when the doWhite span is clicked by the user. 
		$('.lawlabel, .sectionLabel, .Repealed, .HTitleText2, .HTitleText3, .HTitleText4, .HLabel2, .HLabel3, .DefinedTermLink, .DefinedTerm, .MarginalNoteDEF, .MarginalNote, .table, .scheduleTitleText, .scheduleLabel, .SchedHeadL2, .SchedHeadL3').removeClass('whiteText blackText');
		
        return false;
    });
	
// ----------------------------------------------------------------------------------------------doBlack
	
	//Adds clickable functionality to #doBlack span section.
	//This function adds the classes related to doBalck styling of the web page when doBlack selector is clicked. 
	$(document).on('click', '#doBlack', function () {
		
		//Removes the class related to Reader Note border. Sets the Reader Note border to white for doBlack styling.
		$('.ReaderNote').removeClass('ReaderNote').addClass('ReaderNote-doBlack');
		
		//Removes the class related to blank lines in a form. Bottom borders with a short dotted line. Sets the the border to doBlack styling. 
		$('.Leader-dot').removeClass('Leader-dot').addClass('Leader-dot-doBlack');
		
		//Removes the class related to blank lines in a form. Bottom borders with a short dashed line. Sets the the border to doBlack styling. 
		$('.Leader-dash').removeClass('Leader-dash').addClass('Leader-dash-doBlack');
		
		//Removes the class related to blank lines in a form. Bottom borders with a short solid line. Sets the the border to doBlack styling. 
		$('.Leader-solid').removeClass('Leader-solid').addClass('Leader-solid-doBlack');
		
		//Removes the classes related to dashed separator in Related Provisions. Sets the dashed separator to doBlack styling.
		$('.nifrpCitation').removeClass('nifrpCitation').addClass('nifrpCitation-doBlack');
		
		//Removes the classes related to full page styling. Sets the full page style to a doBalck styling.
		$('.docContents, .ScheduleRP, .ScheduleNIF').removeClass('doBlue doGrey doYellow').addClass('doBlack');
		
		//removes the classes related to citations/references. Sets the reference styles to a doBlack styling.
		$('cite').removeClass('XRefExternalAct cite-doBlue cite-doGrey cite-doYellow').addClass('cite-doBlack');
		
		//Removes the classes related to point in time links. Sets the point in time lint to a doBlack styling.
		$('a').removeClass('PITLink PITLink-doBlue PITLink-doGrey PITLink-doYellow').addClass('PITLink-doBlack');
		
		//Removes the class related to blank lines in a form. Bottom borders with a long dotted line. Sets the the border to doBlack styling. 
		$('.LeaderRightJustified-dot').removeClass('LeaderRightJustified-dot').addClass('LeaderRightJustified-dot-doBlack');
		
		//Removes the class related to blank lines in a form. Bottom borders with a long dashed line. Sets the the border to doBlack styling. 
		$('.LeaderRightJustified-dash').removeClass('LeaderRightJustified-dash').addClass('LeaderRightJustified-dash-doBlack');
		
		//Removes the class related to blank lines in a form. Bottom borders with a long solid line. Sets the the border to doBlack styling. 
		$('.LeaderRightJustified-solid').removeClass('LeaderRightJustified-solid').addClass('LeaderRightJustified-solid-doBlack');
		
		//Removes the classes related to nif sectinos that are greyed out. Sets the nif section to doBlack styling. 
		$('.nif, .nif-doBlue, .nif-doGrey, .nif-doYellow').removeClass('nif nif-doBlue nif-doGrey nif-doYellow').addClass('nif-doBlack');
		
		//Removes the classes related to tables. Sets the table hover style to a doBlack styling.
        $('table').removeClass('table-hover table-striped-doBlue table-striped-doGrey table-striped-doYellow').addClass('table-striped-doBlack');
		
		//Removes the classes related to Schedules that have lists. Sets the schedule section with lists with a doBlack styling.
		$('.Schedule, .Schedule-doBlue, .Schedule-doGrey, .Schedule-doYellow').removeClass('Schedule Schedule-doBlue Schedule-doGrey Schedule-doYellow').addClass('Schedule-doBlack');
		
		//Removes the class related to Repealed text. Sets the Repealed text to doBlack styling.
		$('.Repealed, .Repealed-doBlue, .Repealed-doGrey, .Repealed-doYellow').removeClass('Repealed Repealed-doBlue Repealed-doGrey Repealed-doYellow').addClass('Repealed-doBlack');
		
		//Removes the classes related to table borders. Sets the table border to a doBlack styling.
		$('.topdouble, .topdouble-doBlue, .topdouble-doGrey, .topdouble-doYellow').removeClass('topdouble topdouble-doBlue topdouble-doGrey topdouble-doYellow').addClass('topdouble-doBlack');
		
		//Removes the classes related to blockquotes. Sets the blockquote to a doblack styling. 
		$('blockquote, .blockquote-doBlue .blockquote-doGrey .blockquote-doYellow').removeClass('blockquote blockquote-doBlue blockquote-doGrey blockquote-doYellow').addClass('blockquote-doBlack');
		
		//Removes the blackText class and adds the whiteText class for sections that need to be colored white. 
		$('.lawlabel, .sectionLabel, .Repealed, .HTitleText2, .HTitleText3, .HTitleText4, .HLabel2, .HLabel3, .DefinedTermLink, .DefinedTerm, .MarginalNoteDEF, .MarginalNote, .table, .scheduleTitleText, .scheduleLabel, .SchedHeadL2, .SchedHeadL3').removeClass('blackText').addClass('whiteText');

		return false;
    });

// ----------------------------------------------------------------------------------------------doBlue
	
	//Adds clickable functionality to #doBlue span section.
	//This method replicates the doBlack function, but adds the doBlue version of styling when doBlue selector is clicked.
	$(document).on('click', '#doBlue', function () {
		$('.ReaderNote-doBlack').removeClass('ReaderNote-doBlack').addClass('ReaderNote');
		$('.Leader-dot-doBlack').removeClass('Leader-dot-doBlack').addClass('Leader-dot');
		$('.Leader-dash-doBlack').removeClass('Leader-dash-doBlack').addClass('Leader-dash');
		$('.Leader-solid-doBlack').removeClass('Leader-solid-doBlack').addClass('Leader-solid');
		$('.nifrpCitation-doBlack').removeClass('nifrpCitation-doBlack').addClass('nifrpCitation');
		$('.docContents, .ScheduleRP, .ScheduleNIF').removeClass('doBlack doGrey doYellow').addClass('doBlue');
		$('cite').removeClass('XRefExternalAct cite-doBlack cite-doGrey cite-doYellow').addClass('cite-doBlue');
		$('a').removeClass('PITLink PITLink-doBlack PITLink-doGrey PITLink-doYellow').addClass('PITLink-doBlue');
		$('.LeaderRightJustified-dot-doBlack').removeClass('LeaderRightJustified-dot-doBlack').addClass('LeaderRightJustified-dot');
		$('.LeaderRightJustified-dash-doBlack').removeClass('LeaderRightJustified-dash-doBlack').addClass('LeaderRightJustified-dash');
		$('.nif, .nif-doBlack, .nif-doGrey, .nif-doYellow').removeClass('nif nif-doBlack nif-doGrey nif-doYellow').addClass('nif-doBlue');
		$('.LeaderRightJustified-solid-doBlack').removeClass('LeaderRightJustified-solid-doBlack').addClass('LeaderRightJustified-solid');
		$('table').removeClass('table-hover table-striped-doBlack table-striped-doGrey table-striped-doYellow').addClass('table-striped-doBlue');
		$('.Repealed, .Repealed-doBlack, .Repealed-doGrey, .Repealed-doYellow').removeClass('Repealed Repealed-doBlack Repealed-doGrey Repealed-doYellow').addClass('Repealed-doBlue');
		$('.Schedule, .Schedule-doBlack, .Schedule-doGrey, .Schedule-doYellow').removeClass('Schedule Schedule-doBlack Schedule-doGrey Schedule-doYellow').addClass('Schedule-doBlue');
		$('blockquote, .blockquote-doBlack .blockquote-doGrey .blockquote-doYellow').removeClass('blockquote-doBlack blockquote-doGrey blockquote-doYellow').addClass('blockquote-doBlue');
		$('.topdouble, .topdouble-doBlack, .topdouble-doGrey, .topdouble-doYellow').removeClass('topdouble topdouble-doBlack topdouble-doGrey topdouble-doYellow').addClass('topdouble-doBlue');
		$('.lawlabel, .sectionLabel, .Repealed, .HTitleText2, .HTitleText3, .HTitleText4, .HLabel2, .HLabel3, .DefinedTermLink, .DefinedTerm, .MarginalNoteDEF, .MarginalNote, .table, .scheduleTitleText, .scheduleLabel, .SchedHeadL2, .SchedHeadL3').removeClass('whiteText').addClass('blackText');

        return false;
    });	    

// ----------------------------------------------------------------------------------------------doGrey
	
	//Adds clickable functionality to #doGrey span section.
	//This method replicates the doBlack function, but adds the doGrey version of styling when doGrey selector is clicked.
	$(document).on('click', '#doGrey', function () {
		$('.ReaderNote-doBlack').removeClass('ReaderNote-doBlack').addClass('ReaderNote');
		$('.Leader-dot-doBlack').removeClass('Leader-dot-doBlack').addClass('Leader-dot');
		$('.Leader-dash-doBlack').removeClass('Leader-dash-doBlack').addClass('Leader-dash');
		$('.Leader-solid-doBlack').removeClass('Leader-solid-doBlack').addClass('Leader-solid');
		$('.nifrpCitation-doBlack').removeClass('nifrpCitation-doBlack').addClass('nifrpCitation');
		$('.docContents, .ScheduleRP, .ScheduleNIF').removeClass('doBlack doBlue doYellow').addClass('doGrey');
		$('cite').removeClass('XRefExternalAct cite-doBlack cite-doBlue cite-doYellow').addClass('cite-doGrey');
		$('a').removeClass('PITLink PITLink-doBlack PITLink-doBlue PITLink-doYellow').addClass('PITLink-doGrey');
		$('.LeaderRightJustified-dot-doBlack').removeClass('LeaderRightJustified-dot-doBlack').addClass('LeaderRightJustified-dot');
		$('.LeaderRightJustified-dash-doBlack').removeClass('LeaderRightJustified-dash-doBlack').addClass('LeaderRightJustified-dash');
		$('.LeaderRightJustified-solid-doBlack').removeClass('LeaderRightJustified-solid-doBlack').addClass('LeaderRightJustified-solid');
		$('.nif, .nif-doBlue, .nif-doBlack, .nif-doYellow').removeClass('nif nif-doBlue nif-doBlack nif-doYellow').addClass('nif-doGrey');
		$('table').removeClass('table-hover table-striped-doBlack table-striped-doBlue table-striped-doYellow').addClass('table-striped-doGrey');
		$('.Repealed, .Repealed-doBlack, .Repealed-doBlue, .Repealed-doYellow').removeClass('Repealed Repealed-doBlack Repealed-doBlue Repealed-doYellow').addClass('Repealed-doGrey');
		$('.Schedule, .Schedule-doBlack, .Schedule-doBlue, .Schedule-doYellow').removeClass('Schedule Schedule-doBlack Schedule-doBlue Schedule-doYellow').addClass('Schedule-doGrey');
		$('blockquote, .blockquote-doBlack .blockquote-doBlue .blockquote-doYellow').removeClass('blockquote-doBlack blockquote-doBlue blockquote-doYellow').addClass('blockquote-doGrey');
		$('.topdouble, .topdouble-doBlack, .topdouble-doBlue, .topdouble-doYellow').removeClass('topdouble topdouble-doBlack topdouble-doBlue topdouble-doYellow').addClass('topdouble-doGrey');
		$('.lawlabel, .sectionLabel, .Repealed, .HTitleText2, .HTitleText3, .HTitleText4, .HLabel2, .HLabel3, .DefinedTermLink, .DefinedTerm, .MarginalNoteDEF, .MarginalNote, .table, .scheduleTitleText, .scheduleLabel, .SchedHeadL2, .SchedHeadL3').removeClass('whiteText').addClass('blackText');

        return false;
    });

// ----------------------------------------------------------------------------------------------doYellow
	
	//Adds clickable functionality to #doYellow span section.
	//This method replicates the doBlack function, but adds the doYellow version of styling when doYellow selector is clicked.	
	$(document).on('click', '#doYellow', function () {
		$('.ReaderNote-doBlack').removeClass('ReaderNote-doBlack').addClass('ReaderNote');
		$('.Leader-dot-doBlack').removeClass('Leader-dot-doBlack').addClass('Leader-dot');
		$('.Leader-dash-doBlack').removeClass('Leader-dash-doBlack').addClass('Leader-dash');
		$('.Leader-solid-doBlack').removeClass('Leader-solid-doBlack').addClass('Leader-solid');
		$('.nifrpCitation-doBlack').removeClass('nifrpCitation-doBlack').addClass('nifrpCitation');
		$('.docContents, .ScheduleRP, .ScheduleNIF').removeClass('doBlack doGrey doBlue').addClass('doYellow');
		$('cite').removeClass('XRefExternalAct cite-doBlack cite-doBlue cite-doGrey').addClass('cite-doYellow');
		$('a').removeClass('PITLink PITLink-doBlack PITLink-doBlue PITLink-doGrey').addClass('PITLink-doYellow');
		$('.LeaderRightJustified-dot-doBlack').removeClass('LeaderRightJustified-dot-doBlack').addClass('LeaderRightJustified-dot');
		$('.LeaderRightJustified-dash-doBlack').removeClass('LeaderRightJustified-dash-doBlack').addClass('LeaderRightJustified-dash');
		$('.nif, .nif-doBlue, .nif-doGrey, .nif-doBlack').removeClass('nif nif-doBlue nif-doGrey nif-doBlack').addClass('nif-doYellow');
		$('.LeaderRightJustified-solid-doBlack').removeClass('LeaderRightJustified-solid-doBlack').addClass('LeaderRightJustified-solid');
		$('table').removeClass('table-hover table-striped-doBlack table-striped-doBlue table-striped-doGrey').addClass('table-striped-doYellow');
		$('.Repealed, .Repealed-doBlack, .Repealed-doBlue, .Repealed-doGrey').removeClass('Repealed Repealed-doBlack Repealed-doBlue Repealed-doGrey').addClass('Repealed-doYellow');
		$('.Schedule, .Schedule-doBlack, .Schedule-doBlue, .Schedule-doGrey').removeClass('Schedule Schedule-doBlack Schedule-doBlue Schedule-doGrey').addClass('Schedule-doYellow');
		$('blockquote, .blockquote-doBlack .blockquote-doBlue .blockquote-doGrey').removeClass('blockquote-doBlack blockquote-doBlue blockquote-doGrey').addClass('blockquote-doYellow');
		$('.topdouble, .topdouble-doBlack, .topdouble-doBlue, .topdouble-doGrey').removeClass('topdouble topdouble-doBlack topdouble-doBlue topdouble-doGrey').addClass('topdouble-doYellow');
		$('.lawlabel, .sectionLabel, .Repealed, .HTitleText2, .HTitleText3, .HTitleText4, .HLabel2, .HLabel3, .DefinedTermLink, .DefinedTerm, .MarginalNoteDEF, .MarginalNote, .table, .scheduleTitleText, .scheduleLabel, .SchedHeadL2, .SchedHeadL3').removeClass('whiteText').addClass('blackText');
	
        return false;
    });
});  