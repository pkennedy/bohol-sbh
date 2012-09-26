//Open viewer in appropriate sized windows and center on screen
function openViewer(viewerURL, viewerWidth, viewerHeight)
{
	// Initialise defaults
	var showScrollBars = "no";

	// Check screen height
	if (screen.height)
	{
		// set viewer height dependant on screen height
		var maxViewerHeight = (screen.height / 5 ) * 4;
		if (viewerHeight > maxViewerHeight)
		{
			showScrollBars = "yes";
			viewerHeight = maxViewerHeight;
			viewerWidth = viewerWidth + 20;
		}
	}

	//Get center co-ordinates
	var leftPos = (screen.width) ? "left=" + ((screen.width - viewerWidth) / 2) : "";
	var topPos = (screen.height) ? "top=" + ((screen.height - viewerHeight) /2) : "";

	// Open viewer
	openLink(viewerURL, "", viewerWidth, viewerHeight, leftPos + "," + topPos + ",resizeable=0,scrollbars=" + showScrollBars);
}

// Open link if not being run within VAS
function openLink(strURL, strWinName, intWidth, intHeight, strSettings)
{
	// Check if window name was specified
	if (strWinName == "")
		strWinName = "_blank";

	// Open link
	window.open(strURL, strWinName, "width=" + intWidth + ",height=" + intHeight + "," + strSettings);
	return true;
}