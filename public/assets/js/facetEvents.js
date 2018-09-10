function selectFacet(facetType, facet, baseUrl) {

	// Url encode spaces for querystring
	facet = facet.replace(' ', '%20');

	var searchUrl = window.location.href,
		facetParam = "";

	// Remove page param from url if it is there.  Facet update will show updated results from page 1
	searchUrl = searchUrl.replace(/page=[1234567890]*/g, "");
	
	// Create the facet parameter string.  Use ? if the url containd no parameters	
	if(searchUrl.indexOf("?") < 0) {
		facetParam += "?";
	}
	else {
		facetParam += "&";
	}
	facetParam += "f[" + facetType + "][]=" + facet;

	// Add the selected facet param to the search querystring, if it has not been added yet
	if(searchUrl.indexOf(facetParam) <= 0) {
		searchUrl += facetParam;
	}

	return searchUrl;
};

function removeFacet(facetType, facet, baseUrl) {

	// Get current search querystring
	var searchUrl = window.location.href,
		facetParam = "";

	// Remove page param from url if it is there.  Facet update will show updated results from page 1
	searchUrl = searchUrl.replace(/page=[1234567890]*/g, "");

	// Create the facet parameter string.  Use ? if the url containd no parameters	
	if(searchUrl.indexOf("?f") > 0) {
		facetParam += "?f";
	}
	else {
		facetParam += "&f";
	}

	// Get the facet param string to remove from the search querystring
	facetParam += "[" + facetType + "][]=" + facet;
	facetParam = facetParam.replace(/\s/g, "%20");

	// Remove the selected facet param from the search querystring
	searchUrl = searchUrl.replace(facetParam, "");

	return searchUrl;
};

function selectHomeFacet(facetType, facet, baseurl) {
  // Handle unmatching facet label names to their correct facet value
  switch(facet) {
    case "Music Recording":
      facet = "sound recording-musical";
      break;
    case "Nonmusic Recording":
      facet = "sound recording-nonmusical";
      break;
    case "Map":
      facet = "cartographic";
      break;
    case "3D Object":
      facet = "three dimensional object";
      break;
    default:
      break;
  }

  // Url encode spaces for querystring
  facet = facet.replace(' ', '%20');

  // Get search querystring
  var searchUrl = baseurl + "/search?type=all&q=&f[" + facetType + "][]=" + facet;

  return searchUrl;
};

function removeHomeFacet(facetType, facet) {

  // Get the facet param string to remove from the search querystring
  var facetParam = "&f[" + facetType + "][]=" + facet;
  facetParam = facetParam.replace(/\s/g, "%20");

  // Get current search querystring
  url = window.location.href;

  // Remove the selected facet param from the search querystring
  var searchUrl = url.replace(facetParam, "");

  return searchUrl;
};