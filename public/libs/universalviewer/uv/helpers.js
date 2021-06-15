function createUV(selector, data, dataProvider) {
    var uv;
    var isFullScreen = false;
    var $container = $(selector);
    $container.empty();
    var $parent = $('<div></div>');
    $container.append($parent);
    var $uv = $('<div></div>');
    $parent.append($uv);

    function resize() {
        if (uv) {
            if (isFullScreen) {
                $parent.width(window.innerWidth);
                $parent.height(window.innerHeight);
            } else {
                $parent.width($container.width());
                $parent.height($container.height());
            }
            uv.resize();
        }
    }

    window.onresize = function() {
        resize();
    }

    uv = new UV({
        target: $uv[0],
        data: data
    });

    uv.on('create', function(obj) {
        /*
         * DU implementation
         */
        setTimeout(function(){ 
            $(".spinner").append('<div class="loading-msg">Loading, please wait...</div>');
            $(".spinner").append("<div class='timeout-msg' style='display: none'><h6>We're sorry, this is taking longer than expected. To report any problems with accessing this resource, please contact <a href='mailto:archives@du.edu'>archives@du.edu</a></h6></div>")
        
            $(".thumbsView").scroll(function(event) {
                if($("#uv").hasClass("pdf-object")) {
                    updateThumbnailImageUrlsWithPageParam();
                }
            });

            $("#uv button.gallery").click(function(event) {
                $("#uv .thumb .wrap").attr("style", "width: 200px");
                if($("#uv").hasClass("pdf-object")) {
                    updateGridThumbnailImageUrlsWithPageParam();
                }
            });
        }, 1000);
        setTimeout(function(){  
            $(".loading-msg").css("display", "none");
            $(".timeout-msg").css("display", "block");
            $(".spinner").css("background-color", "black");
            $(".spinner").css("background-image", "none !important");
        }, 45000);

        // Kludge: the first link in the index tab will not work after any index link is clicked. 
        // This forces the object to reload whenever the first link in the index is clicked. This object should always be the one in the viewer when the page loads
        setTimeout(function(){
            $("a.index").click(function(ev) {
                $("#tree-link-0-0").click(function(event) {
                    location.reload();
                });

                let links = $(".tree a");
                for(let i=0; i<links.length; i++) {
                    if((i+1) == $("#uv").attr("data-part")) {
                        $("#" + links[i].id).addClass("selected");
                    }
                }
            });
        }, 1500);
        /*
         * End DU implementation
         */
        resize();
    }, false);

    uv.on('created', function(obj) {
        /*
         * DU implementation
         */
        $(".uv-preload-msg").remove();
        /*
         * End DU implementation
         */
        resize();
    },  false);

    uv.on('collectionIndexChanged', function(collectionIndex) {
        dataProvider.set('c', collectionIndex);
    }, false);

    uv.on('manifestIndexChanged', function(manifestIndex) {
        dataProvider.set('m', manifestIndex);
        /*
         * DU implementation
         */
        setTimeout(function() {
            $("#uv").attr("data-part", manifestIndex+1);

            if($("#uv").hasClass("pdf-object")) {
                updateThumbnailImageUrlsWithPageParam();
                updateDownloadUrlsForPart(manifestIndex+1);
            }
        }, 1000);
        /*
         * End DU implementation
         */
    }, false);

    uv.on('sequenceIndexChanged', function(sequenceIndex) {
        dataProvider.set('s', sequenceIndex);
    }, false);

    uv.on('canvasIndexChanged', function(canvasIndex) {
        dataProvider.set('cv', canvasIndex);
        /*
         * DU implementation
         */
        $(".loading-msg").remove();
        $(".timeout-msg").remove();
        $(".spinner").css("background-color", "initial");

        if($("#uv").hasClass("pdf-object") == false &&
            $("#uv").hasClass("compound-object")) {
            updateDownloadUrlsForPart(canvasIndex+1);
        }
        /*
         * End DU implementation
         */
    }, false);

    uv.on('rangeChanged', function(rangeId) {
        dataProvider.set('rid', rangeId);
    }, false);

    uv.on('openseadragonExtension.rotationChanged', function(rotation) {
        dataProvider.set('r', rotation);
    }, false);

    uv.on('openseadragonExtension.xywhChanged', function(xywh) {
        dataProvider.set('xywh', xywh);
    }, false);

    uv.on('openseadragonExtension.currentViewUri', function(data) {
        /*
         * DU implementation
         */
        $(".loading-msg").remove();
        $(".timeout-msg").remove();
        $(".spinner").css("background-color", "initial")
        /*
         * End DU implementation
         */
    }, false);

    uv.on('reload', function(data) {
        data.isReload = true;
        uv.set(data);
    }, false);

    uv.on('toggleFullScreen', function(data) {
        isFullScreen = data.isFullScreen;

        if (data.overrideFullScreen) {
            return;
        }

        var elem = $parent[0];

        if (isFullScreen) {
            var requestFullScreen = getRequestFullScreen(elem);
            if (requestFullScreen) {
                requestFullScreen.call(elem);
                resize();
            }
        } else {
            var exitFullScreen = getExitFullScreen();
            if (exitFullScreen) {
                exitFullScreen.call(document);
                resize();
            }
        }
    }, false);

    uv.on('error', function(message) {
        console.error(message);
    }, false);

    uv.on('bookmark', function(data) {

        var absUri = parent.document.URL;
        var parts = Utils.Urls.getUrlParts(absUri);
        var relUri = parts.pathname + parts.search + parent.document.location.hash;

        if (!relUri.startsWith("/")) {
            relUri = "/" + relUri;
        }

        data.path = relUri;

        console.log('bookmark', data);
    },false);

    $(document).on('fullscreenchange webkitfullscreenchange mozfullscreenchange MSFullscreenChange', function(e) {
        if (e.type === 'webkitfullscreenchange' && !document.webkitIsFullScreen ||
        e.type === 'fullscreenchange' && !document.fullscreenElement ||
        e.type === 'mozfullscreenchange' && !document.mozFullScreen ||
        e.type === 'MSFullscreenChange' && document.msFullscreenElement === null) {
            uv.exitFullScreen();
        }
    });

    return uv;
}

function getRequestFullScreen(elem) {

    if (elem.webkitRequestFullscreen) {
        return elem.webkitRequestFullscreen;
    }

    if (elem.mozRequestFullScreen) {
        return elem.mozRequestFullScreen;
    }

    if (elem.msRequestFullscreen) {
        return elem.msRequestFullscreen;
    } 

    if (elem.requestFullscreen) {
        return elem.requestFullscreen;
    }

    return false;
}

function getExitFullScreen() {

    if (document.webkitExitFullscreen) {
        return document.webkitExitFullscreen;
    }
    
    if (document.msExitFullscreen) {
        return document.msExitFullscreen;
    }
    
    if (document.mozCancelFullScreen) {
        return document.mozCancelFullScreen;
    }

    if (document.exitFullscreen) {
        return document.exitFullscreen;
    }

    return false;
}

/*
 * DU implementation
 * Remove the 't' parameter (added by uv) from the thumbnail images in the left panel, and re-add the pdf page parameter
 */
function updateThumbnailImageUrlsWithPageParam() {
    setTimeout(function() {
    let thumbnailImages = $(".wrap img"), thumbIndex;
    for(var i=0; i < thumbnailImages.length; i++) {
        thumbIndex = thumbnailImages[i].parentElement.parentElement.id.replace("thumb", "");
        if(thumbnailImages[i].src.indexOf("?t") >= 0) {
            thumbnailImages[i].src = thumbnailImages[i].src.substring(0, thumbnailImages[i].src.indexOf("?t")) + "?page=" + (parseInt(thumbIndex)+1);
        }
    }
    }, 250);
}

/*
 * DU implementation
 * Remove the 't' parameter (added by uv) from the thumbnail images in the left panel, and re-add the pdf page parameter
 */
function updateGridThumbnailImageUrlsWithPageParam() {
    setTimeout(function() {
        let thumbnailImages = $(".wrap .thumbImage"), thumbIndex;
        for(var i=0; i < thumbnailImages.length; i++) {
            thumbIndex = parseInt(thumbnailImages[i].parentElement.parentElement.getAttribute("data-index"))+1;
            if(thumbnailImages[i].src.indexOf("?page=") < 0) {
                thumbnailImages[i].src += ("?page=" + thumbIndex.toString());
            }
        }
    }, 500);
}

function updateDownloadUrlsForPart(part) {
    let url = "",
        filename = "",
        baseUrl = window.location.href.substring(0, window.location.href.indexOf("/object")),
        pid = $("#uv").attr("data-pid") || "",
        extension = "file";

    for(var button of $(".download-button")) {
        extension = $("#"+button.id).attr("data-file-type");
        if($("#"+button.id).hasClass("batch-download-button") == false) {
            url = baseUrl + "/datastream/" + pid + "/" + extension + "/" + part + "/" + pid + "_" + part + "." + extension; 
            filename = pid + "_" + part + "." + extension;
            $("#"+button.id).prop("value", url);
        }
    }
}
/*
 * End DU implementation
 */