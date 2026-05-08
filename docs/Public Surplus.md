## **PublicSurplus.com**

**Chrome Developer Console**

While browsing the site using Chrome Developer Console, I noticed that the site uses an API to fetch auction data. By examining the network requests, I was able to identify the API endpoints and the data they return. The following is a summary of the API endpoints and the data they return:

### https://www.publicsurplus.com/sms/all,co/browse/search?posting=y&slth=&page=0&sortBy=&sortDesc=N&keyWord=&catId=-1&endHours=240&startHours=-1&lowerPrice=0&higherPrice=0&milesLocation=-1&zipCode=&region=all%2Cco&search=

Request Method
GET
Status Code
200 OK
Remote Address
69.160.80.45:443
Referrer Policy
strict-origin-when-cross-origin

Response headers:

cache-control
no-cache
cache-control
no-store
content-encoding
gzip
content-language
en-US
content-type
text/html;charset=UTF-8
date
Fri, 08 May 2026 04:01:27 GMT
expires
Thu, 01 Jan 1970 00:00:00 GMT
pragma
no-cache
vary
origin,access-control-request-metho

**Response Body**
<!DOCTYPE html>
<html lang='en'>
<head>
<title>Public Surplus:
Search an auction

</title>
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
            <meta name="template" content="psV2/en/search.ftlh"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link rel="icon" href="/sms/20240825/images/ps_favicon.ico"/>

<link href="/sms/20240825/styles/bootstrap-icons-1.11.1/bootstrap-icons.css" rel="stylesheet" type="text/css" />
<link href="/sms/20240825/styles/bootstrap-5.2.3/bootstrap.min.css" rel="stylesheet" type="text/css" />
<link href="/sms/20240825/styles/ps-v2.css" rel="stylesheet" type="text/css" />
<script type="text/javascript" src="/sms/20240825/js/bootstrap-5.2.3/bootstrap.bundle.min.js"></script>

    <script type="text/javascript">
    onerror = function(msg,url,l){
    	var txt="_s=5b5e9db0aec477a3e701f61252e3b064&_r=img";
    	txt+="&Msg="+escape(msg);
    	txt+="&URL="+escape(url);
    	txt+="&Line="+l;
    	txt+="&Platform="+escape(navigator.platform);
    	txt+="&UserAgent="+escape(navigator.userAgent);
    	var i = document.createElement("img");
    	i.setAttribute("src", (("https:" == document.location.protocol) ? "https://errorstack.appspot.com" : "http://www.errorstack.com") + "/submit?" + txt);
    	document.body.appendChild(i);
    }
    </script>


            <script type="text/javascript" src="/sms/20240825/js/scriptaculous-js-1.8.0/lib/prototype.js"></script>
            <script type="text/javascript" src="/sms/20240825/js/cookie.js"></script>




                    <script type="text/javascript"
                            src="/sms/20240825/js/scriptaculous-js-1.8.0/src/effects.js"></script>



    <link href="/sms/20240825/styles/ps-v2/header-cards.css" rel="stylesheet" type="text/css"/>
    <link href="/sms/20240825/styles/ps-v2/auction-docs.css" rel="stylesheet" type="text/css"/>
    <link href="/sms/20240825/styles/ps-v2/auction/auc-grid.css" rel="stylesheet" type="text/css"/>
    <script type="text/javascript" src="/sms/20240825/js/ps-v2/element-filter.js"></script>
    <script type="text/javascript" src="/sms/20240825/js/ps-v2/time-left-countdown.js"></script>



                    <script type="text/javascript" src="/sms/20240825/js/lightbox-1.2.js"></script>
                    <link href="/sms/20240825/styles/lightbox-1.2.css" rel="stylesheet" type="text/css"/>
                    <link href="/sms/20240825/styles/ps-v2/responsive-lightbox-1.2.css" rel="stylesheet" type="text/css"/>



                    <style type="text/css">

    .right-col {
    	display: flex;
    	flex-direction: column;
    }
    @media (max-width: 991.98px) {
    	.me-col {
    		margin-right: 0;
    	}
    }

                    </style>


            <script type="text/javascript">
                    function Auction_PopupWindow(thispage, name, params, popup) {
    if(!popup){
    	if(this.frameElement){
    		document.location.href=thispage;
    		return;
    	}else{
    		if(iframeModalBootstrap){
    			var modal = document.getElementById(name);
    			if (modal == null) {
    				name = 'iframeModal'
    				modal = document.getElementById(name)
    			}
    			if(modal){
    				modal = bootstrap.Modal.getOrCreateInstance(modal);
    				if(modal){
    					modal.show();
    					iframeModalBootstrap(name, thispage);
    					return;
    				}
    			}
    		}
    	}
    }

    if (name == null) { name = "pop"; }
    thiswindow = window.open(thispage,'psw_'+name,params);

}
/\*\*
_ Sets the 'src' property for an iframe embedded in a given modal.
_ Creates an event listener event to reset the src value once the modal is hidden.
\*/
function iframeModalBootstrap(modalId, iframeSource) {
let iframeModal = document.getElementById("iframe"+modalId);
if (iframeModal !== null) {
iframeModal.setAttribute("src", iframeSource);
}
let iframeModalBootstrap = document.getElementById(modalId)
iframeModalBootstrap.addEventListener('hide.bs.modal', event => {
iframeModal.setAttribute("src", "");
})
}
function loggingOut() {
if (confirm('Are you sure you want to logout?')) {
self.location.href="/sms/all,co/login/logout";
}
}
function loggingIn() {
var currLoc;
if (self.location.pathname && self.location.pathname.indexOf("/login/") < 0 && self.location.pathname.indexOf("/about/") < 0) {
currLoc = "?&dst=" + escape(self.location.pathname.substring("/sms".length) + self.location.search.replace(/\?\_mls=(f|m)/, "").replace(/&\_mls=(f|m)/, ""));
}
else {
currLoc = "";
}
self.location.href="/sms/all,co/login/login" + currLoc;
}
function throttle (cb, delay = 200) {
let shouldWait = false
let waitingArgs = null
let timeout

          const timeoutFn = () => {
            if (waitingArgs === null) {
              shouldWait = false
            } else {
              cb(...waitingArgs)
              waitingArgs = null
              setTimeout(timeoutFn, delay)
            }
          }

          return (...args) => {
            if (shouldWait) {
              waitingArgs = args
              return
            }

            cb(...args)
            shouldWait = true

            clearTimeout(timeout) // Clear the timeout before setting a new one
            timeout = setTimeout(timeoutFn, delay)
          }
        }
                    function addCustomZoom(targetId, enableZoom = false) {
    	if(!enableZoom) return;

    	const handleResize = throttle(() => {
    		setPageScale(targetId)
    	});

    	document.addEventListener("DOMContentLoaded", () => setPageScale(targetId))
    	window.addEventListener("resize", () => { handleResize() } )
    }


    	function setPageScale(targetId) {
    		const target = document.getElementById(targetId)
    		if (!target) return

    		const baseWidth = 1610;
    		const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    		const currentWidth = window.innerWidth - scrollBarWidth;
    		const currentHeight = window.innerHeight;

    		if(currentWidth <= baseWidth) {
    			target.style.transform = 'none';
    			target.style.margin = '0';
    			return;
    		}

    		const scalePercentage = Math.round((currentWidth / baseWidth) * 100);
    		target.style.transform = 'scale(' + scalePercentage + '%)';

    		const verticalMargin = Math.ceil(((currentHeight * (scalePercentage / 100)) - currentHeight) / 2);
    		const horizontalMargin = Math.ceil((((currentWidth * (scalePercentage / 100)) - currentWidth) / 2) / (scalePercentage / 100));

    		target.style.margin = verticalMargin + 'px ' + horizontalMargin + 'px';
    	}

    var daysTimeLeftLoc= 'days';
    var dayTimeLeftLoc= 'day';
    var hoursTimeLeftLoc= 'hours';
    var hourTimeLeftLoc= 'hour';
    var minsTimeLeftLoc= 'mins';
    var minTimeLeftLoc= 'min';
    var secsTimeLeftLoc= 'secs';
    var secTimeLeftLoc= 'sec';
    var endpointExtendTimeLeft = '/sms/all,co/auction/extendedTime';
    var Netscape = (navigator.appName == "Netscape" ? true:false);

function captureKey(e) {
var keycode;
var desiredtarget = 'search';

    if (window.event) {
        keycode = window.event.keyCode;
    }
    else if (e && e.target) {
        if (desiredtarget == null || desiredtarget == e.target.name){
            keycode = e.which;
        }
    }
    else {
        return true;
    }

    if (keycode == 13){
        Search(document.search);
        return false;
    }
    else {
        return true;
    }

}

if (document.addEventListener){
document.addEventListener('keypress', captureKey, false);
} else if (document.attachEvent){
document.attachEvent('onkeypress', captureKey);
}
function toggleAuctionGridView({ view, tab, saveViewMode }) {
if (view === 'g') {
document.querySelectorAll('[id^="auctionGridView"]')
.forEach(grid => {
grid.style.display = '';
});
document.querySelectorAll('[id^="auctionListView"]')
.forEach(grid => {
grid.style.display = 'none';
});
let hideShowImages = document.getElementById('hideShowImages');
if (hideShowImages) {
hideShowImages.style.display = 'none';
}
} else {
document.querySelectorAll('[id^="auctionListView"]')
.forEach(grid => {
grid.style.display = '';
});
let hideShowImages = document.getElementById('hideShowImages');
if (hideShowImages) {
hideShowImages.style.display = '';
}
document.querySelectorAll('[id^="auctionGridView"]')
.forEach(grid => {
grid.style.display = 'none';
});
}

    	if (saveViewMode) {
    		setAuctionViewMode(view, tab);
    	}
    }



    function setAuctionViewMode(view, tab) {
    	if(!view || !tab) return;

    	new Ajax.Request('/sms/all,co/mys/avmc', {
    		method: 'post',
    		parameters: { "view": view, "tab": tab },
    	});
    }
    function jsSmsUrl(service,owp) {

var url = "/sms";
if (owp == null) {
url = url + "/all,co";
}
else if (owp != "") {
url = url + "/" + owp;
}
url = url + service;
return url;
}

    function Search(form) {
    var reg = form.region.options[form.region.selectedIndex].value;
    if ( reg == "-1" ) {
    reg = "";
    }
    form.page.value = 0;
    form.action = jsSmsUrl("/browse/search",reg);
    form.submit();
    }

    function sort(sorttype, sortDesc) {
      document.search.sortBy.value = sorttype;
      document.search.sortDesc.value = sortDesc;
      document.search.page.value = 0;
      document.search.submit();
     }

    function srchPage(pageNumber) {
    document.search.posting.value= "p";
    document.search.page.value = pageNumber;
    document.search.submit();
    }
    function listimg(stat) {
    document.search.slth.value = stat;
    document.search.submit();
    }
    function initPage() {
    	Lightbox.initialize({
    animate:false,
    resizeSpeed:10,
    responsive: true,
    showGroupName:false,
    strings : {
    	closeLink : '[Close]',
    	loadingMsg : 'loading',nextLink : '[Next &raquo;]',
    	prevLink : '[&laquo; Prev]',
    	startSlideshow : '[Start Slideshow]',
    	stopSlideshow : '[Stop Slideshow]',
    	numDisplayPrefix : 'Image',
    	numDisplaySeparator : 'of',
    	description : 'Description'
    },
    closeImage : '/sms/20240825/images/closeLightbox.png',
    blankImage : '/sms/20240825/images/spacer.gif',
    rotateLeftImage : '/sms/20240825/images/rotateLeft.png',
    rotateRightImage : '/sms/20240825/images/rotateRight.png',
    fullScreenImage : '/sms/20240825/images/fullScreen.png',
    closeFromFullScreenImage : '/sms/20240825/images/closeFromFullScreen.png',
    undoFullScreenImage : '/sms/20240825/images/undoFullScreen.png',
    fullScreenRotateLeftImage : '/sms/20240825/images/fullScreenRotateLeft.png',
    fullScreenRotateRightImage : '/sms/20240825/images/fullScreenRotateRight.png',
    urlAjax : '/sms/all,co/aet/ajax',
    txnId : '',
    isIE8 : false,
    isIE10Plus : false,
    showEditDescription : false
    	,lightboxWidth : 1024,lightboxHeight : 768, fullscreenWidth: 1024, fullscreenHeight: 768, enableFullScreen: false, enableSlideshow:false, enableSlideshowFullScreen:false,enableZoom:true
    ,coldscreen: '',
    auctionid:''

});

    }

    var hiddenAuctionsTimeLeft;
    	hiddenAuctionsTimeLeft = 31;
    function timeLeftCallback() {
    	hiddenAuctionsTimeLeft--;
    	if (hiddenAuctionsTimeLeft == 0) {
    		document.getElementById("toggleButtons").remove();
    		document.getElementById("auctionListView").remove();
    		document.getElementById("hideShowImages").remove();
    		document.getElementById("noAuctionsFound").classList.remove("d-none");
    	}
    }

function acceptCookies()
{
var aYearFromNow = new Date();
aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);
$('cookiesAcceptedDiv').hide();
setCookie("cookiesAccepted_1", "Y", aYearFromNow, '/');
}

                    addCustomZoom('zoom-target-id');
            </script>

    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-ML1H9LELDC"></script>
    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag() {
            dataLayer.push(arguments);
        }

        gtag('js', new Date());
        gtag('config', 'G-ML1H9LELDC');
    </script>
        </head>

        <body id="main-body-id" onLoad = "initPage();" >

    <div class="modal fade" id="iframeModal" tabindex="-1" role="dialog"
         aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true" data-bs-focus="true"
    >
        <div class="modal-dialog d-flex align-items-center" style="--bs-modal-width: 60rem;height: calc(100% - var(--bs-modal-margin) * 2);">
            <div class="modal-content h-100" style="max-height: 54rem">
                <div class="modal-body p-1 h-100">
                    <div class="embed-responsive z-depth-1-half h-100">
                        <iframe id="iframeiframeModal" class="embed-responsive-item w-100 h-100" src=""/></iframe>
                    </div>
                </div>
            </div>
        </div>
    </div>





            <a class="skiplink" href="#startcontent" style="display:none;">
                Skip over navigation
            </a>

            <div id="zoom-target-id" class="w-100 h-100 d-flex flex-column">
                    <header>






    <div class="header">
    <script type="text/javascript">
    	//
    	var navfuncs = {
    	 	selectApp : function(sapp) {
    	 	    if (sapp == 'gems') {
    	   			document.location.href = "http://www.publicpurchase.com" + "/gems/browse/home";
    	   		}
    	 	  	if (sapp == 'con') {
    	  			document.location.href = "http://www.publicpurchase.com" + "/contract/home/home";
    	  		}
    			if (sapp == 'req') {
    	  			document.location.href = "http://" + "/gems/pr/home/dash";
    	  		}
    	  		if (sapp == 'vendor') {
    	  			document.location.href = "http://www.publicpurchase.com" + "/vendor/agency/home";
    	  		}
    	  		if (sapp == 'cat') {
    	  			document.location.href = "http://" + "/gems/cat/home/dash";
    	  		}
    	  		if (sapp == 'portal') {
    	  			document.location.href = "http://www.publicpurchase.com" + "/portal/view/home";
    	  		}
    	  		if (sapp == 'surplus') {
    	  			document.location.href = "http://www.publicsurplus.com" + "/sms/browse/home";
    	  		}
    	 	}
    	 }
     </script>
    	 <div class="logo">
    	       <a href="javascript:navfuncs.selectApp('surplus');"><img style="width: 249px" src="/sms/20240825/images/pslogo.svg" title="Public Surplus Logo" alt="Public Surplus" border="0"/></a>
         </div>

    <script type="text/javascript">
        var pslanguage = "en";
    </script>

    <div class="pb-1 d-flex justify-content-end me-2 mt-2 ms-lg-0 ms-auto mb-md-2 mb-lg-0 align-self-start language-container">
        <div
                id="langdiv"
                class="ps-lang-position"
                onmouseover="$('langlistdiv').show();"
                onmouseout="$('langlistdiv').hide();"
        >
            <script type="text/javascript">
                function base_changeLangugage(locale) {
                    if (locale == null) { return; }
                    new Ajax.Request('/sms/all,co/about/home.ftlh?locale='+locale, {
                        onComplete: function() {
                            document.location.reload();
                        }
                    });
                }

                function base_changeTheme(theme) {
                    if (!theme) return;
                    new Ajax.Request('/sms/all,co/login/changeTheme?theme=' + theme, {
                        method: 'post',
                        onSuccess: function() {
                            location.reload(true);
                        }
                    });
                }
            </script>

            <div class="ps-lang-menu">
                <a class="d-flex align-items-center justify-content-between">
                    <img style="vertical-align: top; padding-top: 2px;" alt="English" src="/sms/20240825/images/ps/en.png"/>English

<i title="More Languages" data-bs-toggle="tooltip" aria-label="More Languages" data-bs-custom-class="icon-tooltip" class="bi bi-caret-down-fill small me-2" style="color: var(--ps-color-white); "></i> </a>
</div>

            <div id="langlistdiv" class="ps-lang-list" style="display: none;">
                <ul class="ps-0 mb-0 py-2">
                            <li>
                                <a class="d-flex align-items-center justify-content-start" href="javascript:base_changeLangugage('es');"/>
                                    <img style="vertical-align: top; padding-top: 2px;" alt="Spanish" src="/sms/20240825/images/ps/es.png"/>Spanish

                                </a>
                            </li>
                            <li>
                                <a class="d-flex align-items-center justify-content-start" href="javascript:base_changeLangugage('fr');"/>
                                    <img style="vertical-align: top; padding-top: 2px;" alt="French" src="/sms/20240825/images/ps/fr.png"/>French

                                </a>
                            </li>
                    <li>
                        <a class="d-flex align-items-center justify-content-start" href="javascript:base_changeTheme('psmobile');">

<i aria-hidden="true" class="bi bi-universal-access-circle me-2 pe-1" style="color: var(--ps-color-dark-blue-plus); "></i> WCAG
</a>
</li>
</ul>
</div>
</div>
</div>

     </div>
     <div class="small header-change-theme" style="text-align: right; padding-right: 8px">
     </div>

<!--
 -->

    <nav
    	class="ps-main-bar d-flex flex-wrap navbar navbar-expand-md navbar-light py-0 mt-2 d-print-none">
    	<div class="menu-button-container d-flex d-md-none w-100 pe-2 py-2">
    		<button
    				class="navbar-toggler-menu-button navbar-toggler d-flex ms-auto"
    				type="button"
    				data-bs-toggle="collapse"
    				data-bs-target="#navbarTogglerMenu"
    				aria-controls="navbarTogglerMenu"
    				aria-expanded="false"
    				aria-label="Toggle navigation"
    		>
    			<span class="navbar-toggler-icon align-self-center"></span>
    		</button>
    	</div>

    	<div id="navbarTogglerMenu" class="top-menu collapse navbar-collapse h-100">
    		<div class="navbar-nav top-menu__left nav-sup-left">

<a
class="noborder"
href="javascript:Auction_PopupWindow('/sms/all,co/help/onlineHelp.ftlh','onlineHelp','width=540,height=400,scrollbars=yes,resizable=yes', true);"

> Chat
> <span class="ms-1 nav-bar-chat" title="Live Chat" aria-label="Live Chat" data-bs-custom-class="icon-tooltip">
> <i class="bi bi-chat-left-dots-fill" style="position: absolute; font-size: 0.92rem; color: var(--ps-color-light-blue); color: var(--ps-color-white)"></i>
> <i class="bi bi-chat-right" style="position: relative; top: -4px; left: 6px; font-size: 0.92rem; color: var(--ps-color-light-blue); color: var(--ps-color-white)"></i>
> </span></a> <span class="d-none d-md-inline">|</span>
> <a
> href="#iframeModal"
> data-bs-toggle="modal"
> data-bs-target="#iframeModal"
> onclick="iframeModalBootstrap('iframeModal', '/sms/all,co/help/mainhelp.ftlh?frame1=public/info.ftlh&amp;frame2=public/info_email.ftlh');"
>
> Help
> </a> <span class="d-none d-md-inline">|</span>

    				<a href="javascript:loggingIn();">
    					Login
    				</a>
    		</div>

    		<div class="navbar-nav top-menu__right nav-sup-right">
    			<a  href="/sms/all,co/browse/home?tm=m"
    			   target="_top" >
    				Home
    			</a>    <span class="d-none d-md-inline">|</span>

    			<a  href="/sms/all,co/browse/allcat?tm=m"
    			   target="_top" >
    				Browse
    			</a>    <span class="d-none d-md-inline">|</span>


    			<a class="nav-sup-right-on" href="/sms/all,co/browse/search?tm=m"
    			   target="_top" >
    				Search
    			</a>
    		</div>
    	</div>
    </nav>

<div class="w-100 ps-border-bottom-gross d-none d-md-block"></div>

                    </header>

                <main class="ps-container d-flex flex-wrap flex-column" style="flex: 1; min-height: auto">
                    <div class="d-flex flex-wrap content-container w-100">
                        <aside class="left-col">


                                    <div class="brand-box brand-box--logo p-3 text-center">
    		<img src="/sms/20240825/images/region/co.gif" alt="Colorado">

</div>

                        </aside>

                        <section class="d-flex flex-column right-col" color="gray">


                            <span id="startcontent"></span>



<div class="container-fluid ps-side-home__content__cards d-flex flex-wrap flex-md-nowrap justify-content-center py-3">
	<div class="ps-side-card-container me-md-2">
		<div class="ps-side-card">
			<div class="ps-side-card--img">
				<img src="/sms/20240825/images/ps/img_indexllave.jpg" alt="Graphic of an old key."/>
			</div>

    		<div class="ps-side-card--body">
    			<h5 class="card-title ps-card__body--title mb-2 mb-md-0">
    				Register to become <br>part of Public Surplus
    			</h5>
    			<div class="ps-card__body--children">
    				Click the button below to become a buyer, or <a class="fw-bold" href="/sms/all,co/about/contactus.ftlh">Contact Us</a> for more information.
    				<br/>
    				<button
    					class="ps-button"
    					color="light"
    					type="button"
    					id="Submit32"
    					onclick="self.location.href='/sms/all,co/register/user';"
    				>
    					Register
    				</button>
    			</div>
    		</div>
    	</div>
    </div>

    <div class="ps-side-card-container me-md-2">
    	<div class="ps-side-card">
    		<div class="ps-side-card--img">
    			<img src="/sms/20240825/images/ps/img_indexcompu.jpg" class="imageHome" alt='Image of searching'/>
    		</div>

    		<div class="ps-side-card--body">
    			<h5 class="card-title ps-card__body--title mb-2 mb-md-0">
    				Looking for a <br/>specific item?
    			</h5>

    			<div class="ps-card__body--children">
    				<form action="/sms/all,co/browse/search" method="GET" name="searchCard" onsubmit="updateScopeValue()">
    					<input type="hidden" name="posting" value="y"/>
    					<input type="hidden" name="scope" id="searchScope" value=""/>
    					<label for="keyWord">
    						Let us help you find what you are looking for.
    					</label>

    					<div class="d-flex justify-content-end mt-2">
    						<input class="form-control" id="keyWord" name="keyWord" type="text" size="20"/>
    						<button class="ps-button ms-2" color="light" type="submit" name="Submit4">
    							Search
    						</button>
    					</div>

    					<div class="form-check form-switch pt-2">
    						<input
    							class="form-check-input"
    							type="checkbox"
    							role="switch"
    							id="areaParams"
    							checked
    						/>
    						<label class="form-check-label" for="areaParams">
    							Filtered Search
    						</label>
    					</div>
    				</form>
    			</div>
    		</div>
    	</div>
    </div>

    <div class="ps-side-card-container">
    	<div class="ps-side-card">
    		<div class="ps-side-card--img">
    			<img src="/sms/20240825/images/ps/img_indexmundo.jpg" class="imageHome" alt='Graphic image of flat globe'/>
    		</div>

    		<div class="ps-side-card--body">
    			<h5 class="card-title ps-card__body--title mb-2 mb-md-0">
    				Browse auctions <br>within area
    			</h5>

    			<div class="ps-card__body--children">
    			</div>

    			<div class="mt-2">

<div class="select dropdown">
	<label class="input-group" data-bs-toggle="dropdown" data-bs-display="static">
		<input class="form-control place-strong"
		       type="text"
		       placeholder='Colorado'
		       onkeyup="filterShowOnly('.region.dropdown-menu li', value); tabOnDown(this, event);"
		       aria-describedby="region-select-caret"
		/>
		<span class="input-group-text" id="region-select-caret">
<i aria-hidden="true" class="bi bi-caret-right-fill down" style="color: var(--ps-color-white); color: var(--ps-color-black);"></i><i aria-hidden="true" class="bi bi-caret-down-fill up" style="color: var(--ps-color-white); color: var(--ps-color-black);"></i>        </span>
	</label>

    <ul class="region shaded dropdown-menu">
    		<li>
    			<a class="dropdown-item" href="/sms/browse/search">
    				All
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,al/browse/search">
                    Alabama
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ak/browse/search">
                    Alaska
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,as/browse/search">
                    American Samoa
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,az/browse/search">
                    Arizona
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ar/browse/search">
                    Arkansas
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ca/browse/search">
                    California
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,co/browse/search">
                    Colorado
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ct/browse/search">
                    Connecticut
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,de/browse/search">
                    Delaware
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,fl/browse/search">
                    Florida
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ga/browse/search">
                    Georgia
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,gu/browse/search">
                    Guam
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,hi/browse/search">
                    Hawaii
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,id/browse/search">
                    Idaho
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,il/browse/search">
                    Illinois
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,in/browse/search">
                    Indiana
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ia/browse/search">
                    Iowa
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ks/browse/search">
                    Kansas
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ky/browse/search">
                    Kentucky
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,la/browse/search">
                    Louisiana
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,me/browse/search">
                    Maine
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,md/browse/search">
                    Maryland
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ma/browse/search">
                    Massachusetts
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,mi/browse/search">
                    Michigan
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,mn/browse/search">
                    Minnesota
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ms/browse/search">
                    Mississippi
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,mo/browse/search">
                    Missouri
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,mt/browse/search">
                    Montana
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ne/browse/search">
                    Nebraska
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nv/browse/search">
                    Nevada
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nh/browse/search">
                    New Hampshire
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nj/browse/search">
                    New Jersey
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nm/browse/search">
                    New Mexico
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ny/browse/search">
                    New York
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nc/browse/search">
                    North Carolina
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nd/browse/search">
                    North Dakota
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,oh/browse/search">
                    Ohio
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ok/browse/search">
                    Oklahoma
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,or/browse/search">
                    Oregon
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,pa/browse/search">
                    Pennsylvania
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,pr/browse/search">
                    Puerto Rico
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ri/browse/search">
                    Rhode Island
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,sc/browse/search">
                    South Carolina
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,sd/browse/search">
                    South Dakota
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,tn/browse/search">
                    Tennessee
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,tx/browse/search">
                    Texas
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,vi/browse/search">
                    U.S. Virgin Islands
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ut/browse/search">
                    Utah
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,vt/browse/search">
                    Vermont
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,va/browse/search">
                    Virginia
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,wa/browse/search">
                    Washington
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,dc/browse/search">
                    Washington D.C.
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,wv/browse/search">
                    West Virginia
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,wi/browse/search">
                    Wisconsin
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,wy/browse/search">
                    Wyoming
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ab/browse/search">
                    Alberta
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,bc/browse/search">
                    British Columbia
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,mb/browse/search">
                    Manitoba
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nb/browse/search">
                    New Brunswick
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nl/browse/search">
                    Newfoundland and Labrador
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nt/browse/search">
                    Northwest Territories
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,ns/browse/search">
                    Nova Scotia
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,nu/browse/search">
                    Nunavut
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,on/browse/search">
                    Ontario
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,pe/browse/search">
                    Prince Edward Island
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,qc/browse/search">
                    Quebec
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,sk/browse/search">
                    Saskatchewan
    			</a>
    		</li>
    		<li>
    			<a class="dropdown-item" href="/sms/all,yt/browse/search">
                    Yukon
    			</a>
    		</li>
    </ul>

</div>

    			</div>

    			<div class="mt-2">

<div class="select dropdown">
    <label class="input-group" data-bs-toggle="dropdown" data-bs-display="static">
        <input class="form-control place-strong"
               type="text"
               placeholder='Select Agency'
               onkeyup="filterShowOnly('.agency.dropdown-menu li', value); tabOnDown(this, event);"
               aria-describedby="agency-select-caret"
        />
        <span class="input-group-text" id="agency-select-caret">
<i aria-hidden="true" class="bi bi-caret-right-fill down" style="color: var(--ps-color-white); color: var(--ps-color-black);"></i><i aria-hidden="true" class="bi bi-caret-down-fill up" style="color: var(--ps-color-white); color: var(--ps-color-black);"></i>        </span>
    </label>
    <ul class="agency shaded dropdown-menu">
                <li>
                    <a class="dropdown-item" href="/sms/academysd20,co/browse/search">
                        Academy School District 20
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/adams12,co/browse/search">
                        ADAMS 12 5 STAR SCHOOLS
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/adamscosd,co/browse/search">
                        Adams County School District 14 (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/adams,co/browse/search">
                        Adams State University
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/alamosaco,co/browse/search">
                        Alamosa County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/alamosasd,co/browse/search">
                        Alamosa School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/animashs,co/browse/search">
                        Animas High School
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/apexprd,co/browse/search">
                        Apex Park and Recreation District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/arapahoecosd1,co/browse/search">
                        Arapahoe County School District No. 1
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/archuletaco,co/browse/search">
                        Archuleta County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/arvadafpd,co/browse/search">
                        Arvada Fire Protection District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/aspensd,co/browse/search">
                        Aspen School District RE-1
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/aurorak12,co/browse/search">
                        Aurora Public Schools (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/bgmd,co/browse/search">
                        Bachelor Gulch Metro District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/bayfieldsd,co/browse/search">
                        Bayfield School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/beavercreekmetrodistrict,co/browse/search">
                        Beaver Creek Metro District (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/boulder,co/browse/search">
                        Boulder County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/bouldervalleysd,co/browse/search">
                        Boulder Valley School District RE2
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/canoncity,co/browse/search">
                        Canon City (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/canonre1,co/browse/search">
                        Canon City Schools RE-1
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/msudenver,co/browse/search">
                        Center for Visual Art
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cstudenttransportation,co/browse/search">
                        Central Student Transportation
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/ccsd,co/browse/search">
                        Cherry Creek Schools
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cmsd12,co/browse/search">
                        Cheyenne Mountain School District 12 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/denvercitycounty,co/browse/search">
                        City and County of Denver
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/alamosa,co/browse/search">
                        City of Alamosa
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/aspencity,co/browse/search">
                        City of Aspen (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/aurora,co/browse/search">
                        City of Aurora 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cortez,co/browse/search">
                        City of Cortez (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/durango,co/browse/search">
                        City of Durango (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/pdflorencecolorado,co/browse/search">
                        City of Florence Police Department
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/fcgov,co/browse/search">
                        City of Fort Collins (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/glenwoodsprings,co/browse/search">
                        City of Glenwood Springs (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/grandjunction,co/browse/search">
                        City of Grand Junction (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/greeley,co/browse/search">
                        City of Greeley (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/gunnison,co/browse/search">
                        City of Gunnison (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/lakewood,co/browse/search">
                        City of Lakewood (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/lamar,co/browse/search">
                        City of Lamar
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cityoflittleton,co/browse/search">
                        City of Littleton, Fleet Services
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/longmont,co/browse/search">
                        City of Longmont (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/loveland,co/browse/search">
                        City of Loveland (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/northglenn,co/browse/search">
                        City of Northglenn
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/pueblo,co/browse/search">
                        City of Pueblo (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/salida,co/browse/search">
                        City of Salida (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/steamboatsprings,co/browse/search">
                        City of Steamboat Springs (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/trinidad,co/browse/search">
                        City of Trinidad (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/westminster,co/browse/search">
                        City of Westminster (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/woodlandpark,co/browse/search">
                        City of Woodland Park
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/coloradodfc,co/browse/search">
                        Colorado Disability Funding Committee
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/coloradomesa,co/browse/search">
                        Colorado Mesa University
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/coloradomtn,co/browse/search">
                        Colorado Mountain College
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/coriverboces,co/browse/search">
                        Colorado River BOCES
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cssd11,co/browse/search">
                        Colorado Springs School District 11
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/csutillities,co/browse/search">
                        Colorado Springs Utilities
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/csuequipment,co/browse/search">
                        Colorado Springs Utilities Vehicles and Equipment
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/colostate,co/browse/search">
                        Colorado State University
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/conejosco,co/browse/search">
                        Conejos County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cordillerametro,co/browse/search">
                        Cordillera Metro District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cortezsanitationdistrict,co/browse/search">
                        Cortez Sanitation District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/montezumaco,co/browse/search">
                        County of Montezuma
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/dbsd49jt,co/browse/search">
                        De Beque School District 49-JT
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/deltacosd,co/browse/search">
                        Delta County School District 50J
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/amblicab,co/browse/search">
                        Disability Services, Inc / Envida
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/douglasco,co/browse/search">
                        Douglas County Goverment (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/durangofra,co/browse/search">
                        Durango Fire Protection District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eagleco,co/browse/search">
                        Eagle County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eagleschools,co/browse/search">
                        Eagle County School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eagleriverfire,co/browse/search">
                        Eagle River Fire Protection District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eagleriverwd,co/browse/search">
                        Eagle River Water and Sanitation District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eatonlibrary,co/browse/search">
                        Eaton Public Library
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eatonsd,co/browse/search">
                        Eaton School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/elpasoco,co/browse/search">
                        El Paso County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/falconsd49,co/browse/search">
                        El Paso County School District 49
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/englewoodsd,co/browse/search">
                        Englewood Schools
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/estesparksanitation,co/browse/search">
                        Estes Park Sanitation District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/foothillsprd,co/browse/search">
                        Foothills Park &amp; Recreation District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/flmd,co/browse/search">
                        Forest Lakes Metro District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/fountainsd8,co/browse/search">
                        Fountain School District #8
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/frontrangecc,co/browse/search">
                        Front Range Community College
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/garfield,co/browse/search">
                        Garfield County (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/gunnisonwatershedsd,co/browse/search">
                        Gunnison Watershed School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/hanoversd,co/browse/search">
                         Hanover School District 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/hsd2,co/browse/search">
                        Harrison School District 2
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/haydensd,co/browse/search">
                        Hayden School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/hylandhillspark,co/browse/search">
                        Hyland Hills Park and Recreation District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/laplatacounty,co/browse/search">
                        La Plata County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/larimer,co/browse/search">
                        Larimer County Government
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/larimercoit,co/browse/search">
                        Larimer County Government Department of Information Technology
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/lavetasd2,co/browse/search">
                        La Veta School District RE 2
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/lewispalmerhs,co/browse/search">
                        Lewis Palmer High School
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/liftup,co/browse/search">
                        Lift-Up
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/littletonps,co/browse/search">
                        Littleton Public Schools
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/manzanolasd33,co/browse/search">
                        Manzanola School District 3J
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/mesacvsd,co/browse/search">
                        Mesa County Valley School District #51
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/montezumacortezschoools,co/browse/search">
                        Montezuma Cortez Schools
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/montezumacosheriff,co/browse/search">
                        Montezuma County Sheriff's Office
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/montroseco,co/browse/search">
                        Montrose County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/motors4good,co/browse/search">
                        Motors For Good
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/oteroco,co/browse/search">
                        Otero County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/ppos,co/browse/search">
                        Pagosa Peak Open School
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/parkco,co/browse/search">
                        Park County Government (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/peytonsd,co/browse/search">
                        Peyton School District 23
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/pinnaclecs,co/browse/search">
                        Pinnacle Charter School
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/pitkinco,co/browse/search">
                        Pitkin County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/plainviewsd,co/browse/search">
                        Plainview School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/plattecsd,co/browse/search">
                        Platte Canyon School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/poudrefa,co/browse/search">
                        Poudre Fire Authority
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/poudreschools,co/browse/search">
                        Poudre School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/prowersco,co/browse/search">
                        Prowers County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/pueblocs,co/browse/search">
                        Pueblo City Schools
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/psas,co/browse/search">
                        Pueblo School for Arts and Science
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/rhmaec,co/browse/search">
                        Regional Hazardous Materials Association of Eagle County (RHMAEC)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/rfschools,co/browse/search">
                        Roaring Fork School District Re-1
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/rfta,co/browse/search">
                        Roaring Fork Transportation Authority
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/routtco,co/browse/search">
                        Routt County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/saguacheco,co/browse/search">
                        Saguache County Road &amp; Bridge
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/svvsd,co/browse/search">
                        Saint Vrain Valley School District RE-1J
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/boces,co/browse/search">
                        San Luis Valley BOCES
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/sanmiguelco,co/browse/search">
                        San Miguel County
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/sedgwickco,co/browse/search">
                        Sedgwick county
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/stargatecharterschool,co/browse/search">
                        Stargate Charter School
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/coloradocri,co/browse/search">
                        State of Colorado
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/steamboatspringssd,co/browse/search">
                        Steamboat Springs School District (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/tellerco,co/browse/search">
                        Teller County Government
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/classicalasd20,co/browse/search">
                        The Classical Academy
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/cooutdoorschool,co/browse/search">
                        The Colorado Outdoor Learning School 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/thompsonsd,co/browse/search">
                        Thompson R2-J School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/akron,co/browse/search">
                        Town of Akron
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/avon,co/browse/search">
                        Town of Avon (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/bayfield,co/browse/search">
                        Town of Bayfield
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/bennett,co/browse/search">
                        Town of Bennett
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/breckenridge,co/browse/search">
                        Town of Breckenridge
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/calhan,co/browse/search">
                        Town of Calhan
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/carbondale,co/browse/search">
                        Town of Carbondale (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/castlerock,co/browse/search">
                        Town of Castle Rock
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/center,co/browse/search">
                        Town of Center
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/dolores,co/browse/search">
                        Town of Dolores
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/dovecreek,co/browse/search">
                        Town of Dove Creek (CO) 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/eaglepd,co/browse/search">
                        Town of Eagle
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/erie,co/browse/search">
                        Town of Erie
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/firestone,co/browse/search">
                        Town of Firestone
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/fraser,co/browse/search">
                        Town of Fraser
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/holly,co/browse/search">
                        Town of Holly
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/ignacio,co/browse/search">
                        Town of Ignacio (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/kersey,co/browse/search">
                        Town of Kersey (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/lyons,co/browse/search">
                        Town of Lyons
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/manassa,co/browse/search">
                        Town Of Manassa
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/mancos,co/browse/search">
                        Town of Mancos
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/minturn,co/browse/search">
                        Town of Minturn
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/oakcreek,co/browse/search">
                        Town of Oak Creek
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/pagosasprings,co/browse/search">
                        Town of Pagosa Springs (CO) 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/paonia,co/browse/search">
                        Town of Paonia
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/silt,co/browse/search">
                        Town of Silt (CO) 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/soutfork,co/browse/search">
                        Town of South Fork
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/vail,co/browse/search">
                        Town of Vail (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/ucoloradobd,co/browse/search">
                        University of Colorado
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/unco,co/browse/search">
                        University of Northern Colorado
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/viaco,co/browse/search">
                        Via Mobility Services 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/greeleysd,co/browse/search">
                        Weld County School Dist. #6 - Greeley-Evans
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/weldre5j,co/browse/search">
                        Weld RE5J School District
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/weldsdre8,co/browse/search">
                        Weld RE-8 School District 
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/adams50,co/browse/search">
                        Westminster Public Schools (CO)
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/wracs,co/browse/search">
                        West Ridge Academy Charter School
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/wileyshcool,co/browse/search">
                        Wiley School District RE-13JT
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/wsfr,co/browse/search">
                        Windsor Severance Fire Rescue
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/wpsdk12,co/browse/search">
                        Woodland Park School District RE-2
                    </a>
                </li>
                <li>
                    <a class="dropdown-item" href="/sms/yumaco,co/browse/search">
                        Yuma County
                    </a>
                </li>
    </ul>
</div>

    			</div>

    		</div>
    	</div>
    </div>

</div>

<script type="text/javascript">
	function updateScopeValue() {
		let areaParamsSwitch = document.querySelector('#areaParams');
		let scopeField = document.querySelector('#searchScope');

		if(!areaParamsSwitch || !scopeField) return;

		if (areaParamsSwitch.checked) {
			scopeField.value = "";
		} else {
			scopeField.value = "all";
		}
	}
</script>

    <h1 class="nav-sub-head fs-6">
    	Search Auctions
    </h1>




    <div class="py-4 px-3 px-lg-4">

    	<form action="/sms/all,co/browse/search" method="GET" name="search">
    		<input type="hidden" name="posting" value="y"/>
    		<input type="hidden" name="slth" value=""/>
    		<input type="hidden" name="page"
    			   value="0"/>
    		<input type="hidden" name="sortBy" value=""/>

 			<input type="hidden" name="sortDesc" value="N" />

    		<div class="row mb-4 align-items-center">
    			<div class="col-12 col-lg-4 text-lg-end mb-2 mb-lg-0">
    				<label for="keyword">
    					Keyword
    				</label>
    			</div>
    			<div class="col-12 col-lg-8 col-xl-7 col-xxl-5">
    				<input id="keyword"
    					   class="form-control"
    					   type="text"
    					   value=""
    					   name="keyWord"
    				/>
    			</div>
    		</div>

    		<div class="row mb-4 align-items-center">
    			<div class="col-12 col-lg-4 text-lg-end mb-2 mb-lg-0">
    				<label for="InCategory">
    					In Category
    				</label>
    			</div>
    			<div class="col col-lg-4">
    				<select name="catId" class="form-select" id="InCategory">
    					<option value="-1" >
    						All Categories
    					</option>
    						<option value="22" >
    							Airport
    						</option>
    						<option value="24" >
    							Animals and Livestock
    						</option>
    						<option value="19" >
    							Aviation
    						</option>
    						<option value="10" >
    							Building
    						</option>
    						<option value="16" >
    							Clothing
    						</option>
    						<option value="18" >
    							Collectibles
    						</option>
    						<option value="1" >
    							Computers
    						</option>
    						<option value="2" >
    							Electronics
    						</option>
    						<option value="8" >
    							Food Supply
    						</option>
    						<option value="28" >
    							For Children
    						</option>
    						<option value="14" >
    							Furniture
    						</option>
    						<option value="17" >
    							Heavy Equipment
    						</option>
    						<option value="29" >
    							Heavy Equipment Parts
    						</option>
    						<option value="27" >
    							Housewares
    						</option>
    						<option value="6" >
    							Industrial Equipment
    						</option>
    						<option value="11" >
    							Jewelry
    						</option>
    						<option value="20" >
    							Marine
    						</option>
    						<option value="23" >
    							Medical
    						</option>
    						<option value="4" >
    							Motor Pool
    						</option>
    						<option value="21" >
    							Motor Pool Parts
    						</option>
    						<option value="13" >
    							Music and Arts
    						</option>
    						<option value="3" >
    							Office Equipment
    						</option>
    						<option value="12" >
    							Outdoor Equipment
    						</option>
    						<option value="15" >
    							Real Estate
    						</option>
    						<option value="9" >
    							School Supplies
    						</option>
    						<option value="25" >
    							Scrap
    						</option>
    						<option value="5" >
    							Sporting Goods
    						</option>
    						<option value="26" >
    							Storage
    						</option>
    				</select>
    			</div>
    		</div>

    		<div class="row mb-4 align-items-center" id="currentOptions">
    			<div class="col-12 col-lg-4 text-lg-end mb-2 mb-lg-0">
    				<label for="AucEndIn">
    					Auctions Ending In
    				</label>
    			</div>
    			<div class="col-12 col-lg-8 col-xl-7 col-xxl-5 d-flex flex-wrap flex-sm-nowrap">
    				<div class="col-12 col-sm">
    					<select id="AucEndIn"
    							class="form-select "
    							name="endHours"
    					>
    						<option value="-1" >
    							No Limit
    						</option>
    						<option value="1" >
    							1 hour
    						</option>
    						<option value="6" >
    							6 hours
    						</option>
    						<option value="24" >
    							1 day
    						</option>
    						<option value="120" >
    							5 days
    						</option>
    						<option value="240" selected>
    							10 days
    						</option>
    					</select>
    				</div>
    				<label class="col-12 col-sm-auto text-md-center px-sm-2" for="startsOn">
    					or that Started In
    				</label>
    				<div class="col-12 col-sm">
    					<select
    							class="form-select "
    							name="startHours"
    							id="startsOn"
    					>
    						<option value="-1" >
    							All
    						</option>
    						<option value="1" >
    							the last hour
    						</option>
    						<option value="24" >
    							the last day
    						</option>
    						<option value="48" >
    							the last 2 days
    						</option>
    						<option value="168" >
    							the last week
    						</option>
    					</select>
    				</div>
    			</div>
    		</div>

    		<div class="row mb-1 align-items-center">
    			<div class="col-12 col-lg-4 text-lg-end mb-2 mb-lg-0">
    				<label for="PriceRange">
    					Price Range
    				</label>
    			</div>
    			<div class="col-12 col-lg-8 col-xl-7 col-xxl-5">
    				<div class="row align-items-center">
    					<span class="col-12 col-sm-auto text-md-center">
    						From
    					</span>

    					<div class="col-12 col-sm input-group">
    						<span class="input-group-text" id="lowerPrice">$</span>
    						<input type="text" id="PriceRange"
    							   class="col form-control"
    							   value="0"
    							   name="lowerPrice"
    							   aria-describedby="lowerPrice"
    							   maxlength="8"
    							   size="6"
    						/>
    					</div>

    					<span class="col-12 col-sm-auto text-md-center">
    						To
    					</span>

    					<div class="col-12 col-sm input-group">
    						<span class="input-group-text" id="higherPrice">$</span>
    						<input type="text"
    							   class="col form-control"
    							   value="0"
    							   name="higherPrice"
    							   aria-describedby="higherPrice"
    							   maxlength="8"
    							   size="6"
    						/>
    					</div>
    				</div>
    			</div>
    		</div>

    		<div class="row mb-4 align-items-center">
    			<div class="col offset-lg-4">
    				(
    				leave blank to see all auctions
    				)
    			</div>
    		</div>

    		<div class="row mb-4 align-items-center">
    			<div class="col-12 col-lg-4 text-lg-end mb-2 mb-lg-0">
    				<label for="Located">
    					Located
    				</label>
    			</div>
    			<div class="col-12 col-lg-8 col-xl-7 col-xxl-5 d-flex flex-wrap flex-sm-nowrap">
    				<div class="col-12 col-sm">
    					<select id="Located" class="form-select" name="milesLocation">
    						<option value="-1" >
    							All
    						</option>
    						<option value="20" >20</option>
    						<option value="50" >50</option>
    						<option value="100" >100</option>
    						<option value="200" >200</option>
    						<option value="300" >300</option>
    						<option value="400" >400</option>
    						<option value="500" >500</option>
    						<option value="600" >600</option>
    						<option value="700" >700</option>
    						<option value="800" >800</option>
    						<option value="900" >900</option>
    						<option value="1000" >1000</option>
    					</select>
    				</div>
    				<label class="col-12 col-sm-auto text-md-center px-sm-2" for="fromZip">
    					miles from zip code &nbsp;
    				</label>
    				<div class="col-12 col-sm">
    					<input
    						class="form-control"
    						type="text"
    						name="zipCode"
    						size="10"
    						value=""
    						id="fromZip"
    					/>
    				</div>
    			</div>
    		</div>

    		<div class="row mb-4 align-items-center">
    			<div class="col-12 col-lg-4 text-lg-end mb-2 mb-lg-0"

    			>
    				<label for="inRegion">
    					In Region
    				</label>
    			</div>
    			<div class="col col-lg-4">
    				<select id="inRegion" class="form-select" name="region">
    					<option value="" >All</option>

    <option value="all,al" >
        Alabama
    </option>
    <option value="all,ak" >
        Alaska
    </option>
    <option value="all,as" >
        American Samoa
    </option>
    <option value="all,az" >
        Arizona
    </option>
    <option value="all,ar" >
        Arkansas
    </option>
    <option value="all,ca" >
        California
    </option>
    <option value="all,co" selected>
        Colorado
    </option>
    <option value="all,ct" >
        Connecticut
    </option>
    <option value="all,de" >
        Delaware
    </option>
    <option value="all,fl" >
        Florida
    </option>
    <option value="all,ga" >
        Georgia
    </option>
    <option value="all,gu" >
        Guam
    </option>
    <option value="all,hi" >
        Hawaii
    </option>
    <option value="all,id" >
        Idaho
    </option>
    <option value="all,il" >
        Illinois
    </option>
    <option value="all,in" >
        Indiana
    </option>
    <option value="all,ia" >
        Iowa
    </option>
    <option value="all,ks" >
        Kansas
    </option>
    <option value="all,ky" >
        Kentucky
    </option>
    <option value="all,la" >
        Louisiana
    </option>
    <option value="all,me" >
        Maine
    </option>
    <option value="all,md" >
        Maryland
    </option>
    <option value="all,ma" >
        Massachusetts
    </option>
    <option value="all,mi" >
        Michigan
    </option>
    <option value="all,mn" >
        Minnesota
    </option>
    <option value="all,ms" >
        Mississippi
    </option>
    <option value="all,mo" >
        Missouri
    </option>
    <option value="all,mt" >
        Montana
    </option>
    <option value="all,ne" >
        Nebraska
    </option>
    <option value="all,nv" >
        Nevada
    </option>
    <option value="all,nh" >
        New Hampshire
    </option>
    <option value="all,nj" >
        New Jersey
    </option>
    <option value="all,nm" >
        New Mexico
    </option>
    <option value="all,ny" >
        New York
    </option>
    <option value="all,nc" >
        North Carolina
    </option>
    <option value="all,nd" >
        North Dakota
    </option>
    <option value="all,oh" >
        Ohio
    </option>
    <option value="all,ok" >
        Oklahoma
    </option>
    <option value="all,or" >
        Oregon
    </option>
    <option value="all,pa" >
        Pennsylvania
    </option>
    <option value="all,pr" >
        Puerto Rico
    </option>
    <option value="all,ri" >
        Rhode Island
    </option>
    <option value="all,sc" >
        South Carolina
    </option>
    <option value="all,sd" >
        South Dakota
    </option>
    <option value="all,tn" >
        Tennessee
    </option>
    <option value="all,tx" >
        Texas
    </option>
    <option value="all,vi" >
        U.S. Virgin Islands
    </option>
    <option value="all,ut" >
        Utah
    </option>
    <option value="all,vt" >
        Vermont
    </option>
    <option value="all,va" >
        Virginia
    </option>
    <option value="all,wa" >
        Washington
    </option>
    <option value="all,dc" >
        Washington D.C.
    </option>
    <option value="all,wv" >
        West Virginia
    </option>
    <option value="all,wi" >
        Wisconsin
    </option>
    <option value="all,wy" >
        Wyoming
    </option>
    <option value="all,ab" >
        Alberta
    </option>
    <option value="all,bc" >
        British Columbia
    </option>
    <option value="all,mb" >
        Manitoba
    </option>
    <option value="all,nb" >
        New Brunswick
    </option>
    <option value="all,nl" >
        Newfoundland and Labrador
    </option>
    <option value="all,nt" >
        Northwest Territories
    </option>
    <option value="all,ns" >
        Nova Scotia
    </option>
    <option value="all,nu" >
        Nunavut
    </option>
    <option value="all,on" >
        Ontario
    </option>
    <option value="all,pe" >
        Prince Edward Island
    </option>
    <option value="all,qc" >
        Quebec
    </option>
    <option value="all,sk" >
        Saskatchewan
    </option>
    <option value="all,yt" >
        Yukon
    </option>
    				</select>
    			</div>
    		</div>

    		<div class="d-flex flex-nowrap justify-content-between">
    			<div class="col offset-lg-4">
    				<button
    					type="submit"
    					name="search"
    					color="light"
    					class="ps-button ms-lg-2"
    					onclick="Search(document.search);"
    				>
    					Search
    				</button>
    			</div>

    <script>
    	document.addEventListener('DOMContentLoaded', () => {
    	hideLazyImagesLoadingIcon();
    });

    function hideLazyImagesLoadingIcon() {
    	const lazyImgContainers = document.querySelectorAll('.lazy-loading-container-loader');

    	lazyImgContainers?.forEach((container) => {
    		const lazyImg = container.querySelector('.lazy-img-loading');
    		let lazyIcon = container.querySelector('.lazy-loading-icon');

    		if (!lazyIcon || !lazyImg) return;

    		//Due to cache, the completion of image loading may occur before the 'load' event listener can be set.
    		if(lazyImg.complete) {
    			lazyIcon.style = 'display: none';
    			return;
    		}

    		lazyImg.onerror = function() {
    			lazyIcon.style = 'display: none';
    		}

    		lazyImg.addEventListener('load', function() {
    			lazyIcon.style = 'display: none';
    		});
    	});
    	loadInfoIcon();
    }

    function loadInfoIcon() {
    	document.querySelectorAll('[id^="bi_"]').forEach(infoIcon => {
    		let popoverIcon = new bootstrap.Popover(infoIcon, {
    			html : true,
    			trigger: 'focus hover',
    			delay: { "hide": 100 }, // Used to allow a click on the icon's anchor.
    			sanitize: false,
    			content: function() {
    				return document.querySelector(infoIcon.getAttribute("data-popover-content")).innerHTML;
    			}
    		});
    		infoIcon.addEventListener('shown.bs.popover', () => {
    			popoverIcon.tip.getElementsBySelector('[data-bs-custom-class="icon-tooltip"]').forEach(icon => {
    				activateIconTooltip(icon);
    			});
    		});
    		infoIcon.addEventListener('hide.bs.popover', () => {
    			popoverIcon.tip.getElementsBySelector('[data-bs-custom-class="icon-tooltip"]').forEach(icon => {
    				disposeIconTooltip(icon);
    			});
    		});
    	});
    }
    </script>

    				<div id="toggleButtons" class="col col-lg-4 text-end">
    <span class="ps-2">
    	View
    	<button class="ps-button text-center ps-2" color="link" type="button" onclick="toggleAuctionGridView({ view: 'g', tab:'search', saveViewMode: 'true' });">

<i title="Grid view" data-bs-toggle="tooltip" aria-label="Grid view" data-bs-custom-class="icon-tooltip" class="bi bi-grid " style="color: var(--ps-color-gray); "></i> </button>
<button class="ps-button text-center px-2" color="link" type="button" onclick="toggleAuctionGridView({ view: 'l', tab:'search', saveViewMode: 'true' });">
<i title="List view" data-bs-toggle="tooltip" aria-label="List view" data-bs-custom-class="icon-tooltip" class="bi bi-list " style="color: var(--ps-color-gray); "></i> </button>
</span>
</div>
</div>
</form>
</div>
<div class="me-col">
<div class="ajax-loading-pagination">
<div class="d-flex justify-content-center align-items-center mt-2">
<span class="fw-bold a disabled me-2">
<span class="small">&laquo;</span>
</span>
<span class="fw-bold a disabled me-2">
<span class="small me-1">&#139;</span>Prev
</span>
<strong class="me-2">
1
</strong>
<span class="me-2" role="button" onclick="srchPage('1');">
2
</span>
&nbsp;
<span class="fw-bold me-2" role="button" onclick="srchPage('1');">
Next<span class="small ms-1">&#155;</span>
</span>
<span class="fw-bold me-2" role="button" onclick="srchPage('1');">
<span class="small">&raquo;</span>
</span>
</div>
</div>

    	</div>

                        </section>
                    </div>


    	<div class="wide-content-container">
    		<div class="w-100 ps-border-bottom-gross d-none d-md-block"></div>
    			<div id="auctionGridView" class="w-100 p-2" >
    	<div class="mb-2 auction-items__container" id="auction_item">
    		<section class="w-100 ps-card-feat"  id="auctionsListContainer">


    			<div class="auction-item" id="4000349searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000349"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000349/69723871"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000349searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000349"
    							title="#4000349 - MOBILE USED SALAD BARS "
    						>
    							#4000349 - MOBILE USED SALAD BARS
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000349searchGrid">
    									$150.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000349searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000349searchGrid" class="">
    				16 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000349, "4000349searchGrid",
    			1778212888297, 1778274000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4000272searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000272"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000272/69718178"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000272searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000272"
    							title="#4000272 - KITCHEN PREP TABLE"
    						>
    							#4000272 - KITCHEN PREP TABLE
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000272searchGrid">
    									$50.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000272searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000272searchGrid" class="">
    				16 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000272, "4000272searchGrid",
    			1778212888297, 1778274000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4000489searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000489"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000489/68110786"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000489searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000489"
    							title="#4000489 - Three Boxes of iPad Cases "
    						>
    							#4000489 - Three Boxes of iPad Cases
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000489searchGrid">
    									$52.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000489searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000489searchGrid" class="">
    				22 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000489, "4000489searchGrid",
    			1778212888297, 1778295600000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4000490searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000490"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000490/54811042"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000490searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000490"
    							title="#4000490 - Tripods"
    						>
    							#4000490 - Tripods
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000490searchGrid">
    									$20.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000490searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000490searchGrid" class="">
    				22 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000490, "4000490searchGrid",
    			1778212888297, 1778295600000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4000493searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000493"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000493/69398292"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000493searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000493"
    							title="#4000493 - Power Expand 8-in-1 USB-C PD Data Hub"
    						>
    							#4000493 - Power Expand 8-in-1 USB-C PD Data Hub
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000493searchGrid">
    									$50.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000493searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000493searchGrid" class="">
    				22 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000493, "4000493searchGrid",
    			1778212888297, 1778295600000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3999191searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3999191"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3999191/69007134"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3999191searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3999191"
    							title="#3999191 - Refrigerator / Freezer / Walk In"
    						>
    							#3999191 - Refrigerator / Freezer / Walk In
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3999191searchGrid">
    									$3,500.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3999191searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3999191searchGrid" class="">
    				2 days 15 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3999191, "3999191searchGrid",
    			1778212888297, 1778443200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3999239searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3999239"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3999239/69434295"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3999239searchGrid" class="hidden">
							<div class="d-flex align-items-center">

<img src="/sms/20240825/images/auction/dutch.gif" title="Dutch Auction" alt="Dutch Auction" data-bs-toggle="tooltip" data-bs-custom-class="icon-tooltip" class="me-1 align-baseline" style="" width="25" height="14"/>

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3999239"
    							title="#3999239 - S/S Sinks "
    						>
    							#3999239 - S/S Sinks
    						</a>

<img src="/sms/20240825/images/auction/dutch.gif" title="Dutch Auction" alt="Dutch Auction" data-bs-toggle="tooltip" data-bs-custom-class="icon-tooltip" class="align-baseline" style="width: 1rem; height: 0.625rem" width="25" height="14"/>

    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3999239searchGrid">
    									$20.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3999239searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3999239searchGrid" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3999239, "3999239searchGrid",
    			1778212888297, 1778452200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3976780searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3976780"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976780/69186075"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3976780searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3976780"
    							title="#3976780 - Mother's Day &quot;IMMOM&quot; CO Vanity License Plate"
    						>
    							#3976780 - Mother's Day &quot;IMMOM&quot; CO Va...
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3976780searchGrid">
    									$200.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3976780searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3976780searchGrid" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976780, "3976780searchGrid",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3976757searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3976757"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976757/69185486"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3976757searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3976757"
    							title="#3976757 - Mother's Day &quot;MAMAOF4&quot; CO Vanity License Plate"
    						>
    							#3976757 - Mother's Day &quot;MAMAOF4&quot; CO
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3976757searchGrid">
    									$200.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3976757searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3976757searchGrid" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976757, "3976757searchGrid",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3976767searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3976767"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976767/69185813"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3976767searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3976767"
    							title="#3976767 - Mother's Day &quot;MOM OF2&quot; CO Vanity License Plate"
    						>
    							#3976767 - Mother's Day &quot;MOM OF2&quot; CO Vanity
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3976767searchGrid">
    									$200.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3976767searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3976767searchGrid" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976767, "3976767searchGrid",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3976769searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3976769"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976769/69185821"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3976769searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3976769"
    							title="#3976769 - Mother's Day &quot;BZMOM&quot; CO Vanity License Plate"
    						>
    							#3976769 - Mother's Day &quot;BZMOM&quot; CO Va...
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3976769searchGrid">
    									$200.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3976769searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3976769searchGrid" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976769, "3976769searchGrid",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3976781searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3976781"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976781/69186101"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3976781searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3976781"
    							title="#3976781 - Mother's Day &quot;4BN MOM&quot; CO Vanity License Plate"
    						>
    							#3976781 - Mother's Day &quot;4BN MOM&quot; CO Vanity
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3976781searchGrid">
    									$200.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3976781searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3976781searchGrid" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976781, "3976781searchGrid",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3992826searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3992826"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3992826/69552198"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3992826searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3992826"
    							title="#3992826 - For Sale: Grasshopper Commercial Mower with Powervac Collection System"
    						>
    							#3992826 - For Sale: Grasshopper Commercial Mo...
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3992826searchGrid">
    									$9,500.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3992826searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3992826searchGrid" class="">
    				3 days 11 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3992826, "3992826searchGrid",
    			1778212888297, 1778515200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3995517searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3995517"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3995517/69615257"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3995517searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3995517"
    							title="#3995517 - Android tv streaming device"
    						>
    							#3995517 - Android tv streaming device
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3995517searchGrid">
    									$10.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3995517searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3995517searchGrid" class="">
    				3 days 13 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3995517, "3995517searchGrid",
    			1778212888297, 1778522400000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4004110searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4004110"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4004110/69008944"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4004110searchGrid" class="hidden">
							<div class="d-flex align-items-center">

<i title="Newly Listed Item" data-bs-toggle="tooltip" aria-label="Newly Listed Item" data-bs-custom-class="icon-tooltip" class="bi bi-patch-exclamation me-1 align-baseline" style="color: var(--ps-color-green-plus); "></i>

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4004110"
    							title="#4004110 - LAKESHORE INFANT CLASSROOM #1"
    						>
    							#4004110 - LAKESHORE INFANT CLASSROOM #1
    						</a>

<i title="Newly Listed Item" data-bs-toggle="tooltip" aria-label="Newly Listed Item" data-bs-custom-class="icon-tooltip" class="bi bi-patch-exclamation align-baseline" style="color: var(--ps-color-green-plus); font-size: 0.79rem"></i>

    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4004110searchGrid">
    									$900.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4004110searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4004110searchGrid" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4004110, "4004110searchGrid",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3991814searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3991814"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3991814/69529135"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3991814searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3991814"
    							title="#3991814 - 2002 Dodge Dakota 4x4 Pickup"
    						>
    							#3991814 - 2002 Dodge Dakota 4x4 Pickup
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3991814searchGrid">
    									$667.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3991814searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3991814searchGrid" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3991814, "3991814searchGrid",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4001015searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4001015"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4001015/69406911"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4001015searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4001015"
    							title="#4001015 - EXERCISE BIKES "
    						>
    							#4001015 - EXERCISE BIKES
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4001015searchGrid">
    									$150.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4001015searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4001015searchGrid" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4001015, "4001015searchGrid",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4001012searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4001012"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4001012/69605572"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4001012searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4001012"
    							title="#4001012 - TURF SPREADERS"
    						>
    							#4001012 - TURF SPREADERS
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4001012searchGrid">
    									$50.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4001012searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4001012searchGrid" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4001012, "4001012searchGrid",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3991793searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3991793"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3991793/69528872"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3991793searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3991793"
    							title="#3991793 - Electric Backpack Leaf Blower"
    						>
    							#3991793 - Electric Backpack Leaf Blower
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3991793searchGrid">
    									$50.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3991793searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3991793searchGrid" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3991793, "3991793searchGrid",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3996607searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3996607"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3996607/69626235"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3996607searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3996607"
    							title="#3996607 - HP Toner Cartridges"
    						>
    							#3996607 - HP Toner Cartridges
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3996607searchGrid">
    									$26.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3996607searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3996607searchGrid" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3996607, "3996607searchGrid",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4001725searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4001725"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4001725/69376856"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4001725searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4001725"
    							title="#4001725 - Grizzly Bandsaw"
    						>
    							#4001725 - Grizzly Bandsaw
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4001725searchGrid">
    									$53.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4001725searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4001725searchGrid" class="">
    				3 days 22 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4001725, "4001725searchGrid",
    			1778212888297, 1778554800000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4000491searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000491"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000491/67774517"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000491searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000491"
    							title="#4000491 - Logitech Blue Microphone Snowball"
    						>
    							#4000491 - Logitech Blue Microphone Snowb...
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000491searchGrid">
    									$10.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000491searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000491searchGrid" class="">
    				3 days 22 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000491, "4000491searchGrid",
    			1778212888297, 1778554800000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="4000492searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=4000492"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000492/67871500"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_4000492searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=4000492"
    							title="#4000492 - Dishwasher"
    						>
    							#4000492 - Dishwasher
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_4000492searchGrid">
    									$20.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft4000492searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue4000492searchGrid" class="">
    				3 days 22 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000492, "4000492searchGrid",
    			1778212888297, 1778554800000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3965208searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3965208"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3965208/68932334"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3965208searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3965208"
    							title="#3965208 - 2015 Toro Zero Turn Mower w/52&quot; Deck"
    						>
    							#3965208 - 2015 Toro Zero Turn Mower w/52&quot; Deck
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3965208searchGrid">
    									$504.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3965208searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3965208searchGrid" class="">
    				4 days 15 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3965208, "3965208searchGrid",
    			1778212888297, 1778616000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>


    			<div class="auction-item" id="3979516searchGrid">
    				<div class="auction-item-img">
    					<a
    							href="/sms/all,co/auction/view?auc=3979516"
    					>
    							<div class="position-relative lazy-loading-container lazy-loading-container-loader">
    								<img
    									class="lazy-img-loading"
    									loading="lazy"
    									src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3979516/69546905"
    									alt="View Images"
    								/>

<div class="loading-spinner lazy-loading-icon" style="" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>								</div>
						</a>
						<span class="auction-item-state">
							CO
						</span>
					</div>
					<div class="auction-item-body px-0">
						<div id="ai_3979516searchGrid" class="hidden">
							<div class="d-flex align-items-center">

    						</div>
    					</div>

    					<h6 class="w-100 card-title ps-card-feat__body--title ps-1 mb-2">
    						<a
    								href="/sms/all,co/auction/view?auc=3979516"
    							title="#3979516 - 2012 Toro Zero Turn Mower w/52&quot; Deck"
    						>
    							#3979516 - 2012 Toro Zero Turn Mower w/52&quot; Deck
    						</a>
    					</h6>

    					<div class="w-100 ps-card__body--children px-1">
    							Price:
    							<b id="val_3979516searchGrid">
    									$504.00
    							</b>
    							<br/>

    							<div class="fw-bold">
    <div id="timeLeft3979516searchGrid" class="d-inline w-100 auction-time_left">
    		<label class="text-nowrap w-auto align-self-center fw-normal">
    			Time Left:
    		</label>
    		<span id="timeLeftValue3979516searchGrid" class="">
    				4 days 15 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3979516, "3979516searchGrid",
    			1778212888297, 1778616000000, 0, "",
    			"", "searchList" , timeLeftCallback);
    	</script>
    							</div>
    					</div>

    					<div id="buttons" class="d-flex w-100 justify-content-end align-items-center mt-auto">
    					</div>
    				</div>
    			</div>
    		</section>
    	</div>
    			</div>

    			<div id="auctionListView" class="w-100" style="display: none">
    				<table class="ps-table table table-responsive-md">
    					<thead>
    					<tr>
    						<th scope="col">
    <div role="button" class="sort-by-table" onclick="sort('id', 'N');">

<i aria-hidden="true" class="bi bi-caret-right-fill " style="color: var(--ps-color-gray-plus); font-size: 0.9rem; "></i> Auction
</div>
</th>
<th scope="col">
<div role="button" class="sort-by-table" onclick="sort('title', 'N');">
<i aria-hidden="true" class="bi bi-caret-right-fill " style="color: var(--ps-color-gray-plus); font-size: 0.9rem; "></i> Title
</div>
</th>
<th scope="col">&nbsp;</th>
<th scope="col">&nbsp;</th>
<th nowrap scope="col">
<div role="button" class="sort-by-table" onclick="sort('timeLeft', 'N');">
<i aria-hidden="true" class="bi bi-caret-right-fill " style="color: var(--ps-color-gray-plus); font-size: 0.9rem; "></i> Time Left
</div>
</th>
<th scope="col">
<div role="button" class="sort-by-table" onclick="sort('price', 'N');">
<i aria-hidden="true" class="bi bi-caret-right-fill " style="color: var(--ps-color-gray-plus); font-size: 0.9rem; "></i> Current Price
</div>
</th>
</tr>
</thead>
<tbody>
<tr id="4000349searchList">
<td>4000349</td>
<td class="text-start">
<a href="/sms/all,co/auction/view?auc=4000349">MOBILE USED SALAD BARS </a>

    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000349"
        rel="-ajax-lightbox-4000349"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000349/69723871"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000349searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000349searchList" class="">
    				16 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000349, "4000349searchList",
    			1778212888297, 1778274000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000349searchList">
    										$150.00
    								</td>
    							</tr>
    							<tr id="4000272searchList">
    								<td>4000272</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4000272">KITCHEN PREP TABLE</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000272"
        rel="-ajax-lightbox-4000272"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000272/69718178"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000272searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000272searchList" class="">
    				16 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000272, "4000272searchList",
    			1778212888297, 1778274000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000272searchList">
    										$50.00
    								</td>
    							</tr>
    							<tr id="4000489searchList">
    								<td>4000489</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4000489">Three Boxes of iPad Cases </a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000489"
        rel="-ajax-lightbox-4000489"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000489/68110786"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000489searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000489searchList" class="">
    				22 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000489, "4000489searchList",
    			1778212888297, 1778295600000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000489searchList">
    										$52.00
    								</td>
    							</tr>
    							<tr id="4000490searchList">
    								<td>4000490</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4000490">Tripods</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000490"
        rel="-ajax-lightbox-4000490"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000490/54811042"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000490searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000490searchList" class="">
    				22 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000490, "4000490searchList",
    			1778212888297, 1778295600000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000490searchList">
    										$20.00
    								</td>
    							</tr>
    							<tr id="4000493searchList">
    								<td>4000493</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4000493">Power Expand 8-in-1 USB-C PD Data Hub</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000493"
        rel="-ajax-lightbox-4000493"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000493/69398292"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000493searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000493searchList" class="">
    				22 hours 58 mins
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000493, "4000493searchList",
    			1778212888297, 1778295600000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000493searchList">
    										$50.00
    								</td>
    							</tr>
    							<tr id="3999191searchList">
    								<td>3999191</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3999191">Refrigerator / Freezer / Walk In</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3999191"
        rel="-ajax-lightbox-3999191"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3999191/69007134"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3999191searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3999191searchList" class="">
    				2 days 15 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3999191, "3999191searchList",
    			1778212888297, 1778443200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3999191searchList">
    										$3,500.00
    								</td>
    							</tr>
    							<tr id="3999239searchList">
    								<td>3999239</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3999239">S/S Sinks </a>

<img src="/sms/20240825/images/auction/dutch.gif" title="Dutch Auction" alt="Dutch Auction" data-bs-toggle="tooltip" data-bs-custom-class="icon-tooltip" class="me-1 align-baseline" style="" width="25" height="14"/>

    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3999239"
        rel="-ajax-lightbox-3999239"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3999239/69434295"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3999239searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3999239searchList" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3999239, "3999239searchList",
    			1778212888297, 1778452200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3999239searchList">
    										$20.00
    								</td>
    							</tr>
    							<tr id="3976780searchList">
    								<td>3976780</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3976780">Mother's Day &quot;IMMOM&quot; CO Vanity License Plate</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3976780"
        rel="-ajax-lightbox-3976780"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976780/69186075"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3976780searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3976780searchList" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976780, "3976780searchList",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3976780searchList">
    										$200.00
    								</td>
    							</tr>
    							<tr id="3976757searchList">
    								<td>3976757</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3976757">Mother's Day &quot;MAMAOF4&quot; CO Vanity License Plate</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3976757"
        rel="-ajax-lightbox-3976757"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976757/69185486"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3976757searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3976757searchList" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976757, "3976757searchList",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3976757searchList">
    										$200.00
    								</td>
    							</tr>
    							<tr id="3976767searchList">
    								<td>3976767</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3976767">Mother's Day &quot;MOM OF2&quot; CO Vanity License Plate</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3976767"
        rel="-ajax-lightbox-3976767"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976767/69185813"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3976767searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3976767searchList" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976767, "3976767searchList",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3976767searchList">
    										$200.00
    								</td>
    							</tr>
    							<tr id="3976769searchList">
    								<td>3976769</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3976769">Mother's Day &quot;BZMOM&quot; CO Vanity License Plate</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3976769"
        rel="-ajax-lightbox-3976769"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976769/69185821"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3976769searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3976769searchList" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976769, "3976769searchList",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3976769searchList">
    										$200.00
    								</td>
    							</tr>
    							<tr id="3976781searchList">
    								<td>3976781</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3976781">Mother's Day &quot;4BN MOM&quot; CO Vanity License Plate</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3976781"
        rel="-ajax-lightbox-3976781"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3976781/69186101"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3976781searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3976781searchList" class="">
    				2 days 18 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3976781, "3976781searchList",
    			1778212888297, 1778454000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3976781searchList">
    										$200.00
    								</td>
    							</tr>
    							<tr id="3992826searchList">
    								<td>3992826</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3992826">For Sale: Grasshopper Commercial Mower with Powervac Collection System</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3992826"
        rel="-ajax-lightbox-3992826"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3992826/69552198"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3992826searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3992826searchList" class="">
    				3 days 11 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3992826, "3992826searchList",
    			1778212888297, 1778515200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3992826searchList">
    										$9,500.00
    								</td>
    							</tr>
    							<tr id="3995517searchList">
    								<td>3995517</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3995517">Android tv streaming device</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3995517"
        rel="-ajax-lightbox-3995517"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3995517/69615257"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3995517searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3995517searchList" class="">
    				3 days 13 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3995517, "3995517searchList",
    			1778212888297, 1778522400000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3995517searchList">
    										$10.00
    								</td>
    							</tr>
    							<tr id="4004110searchList">
    								<td>4004110</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4004110">LAKESHORE INFANT CLASSROOM #1</a>

<i title="Newly Listed Item" data-bs-toggle="tooltip" aria-label="Newly Listed Item" data-bs-custom-class="icon-tooltip" class="bi bi-patch-exclamation me-1 align-baseline" style="color: var(--ps-color-green-plus); "></i>

    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4004110"
        rel="-ajax-lightbox-4004110"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4004110/69008944"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4004110searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4004110searchList" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4004110, "4004110searchList",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4004110searchList">
    										$900.00
    								</td>
    							</tr>
    							<tr id="3991814searchList">
    								<td>3991814</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3991814">2002 Dodge Dakota 4x4 Pickup</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3991814"
        rel="-ajax-lightbox-3991814"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3991814/69529135"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3991814searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3991814searchList" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3991814, "3991814searchList",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3991814searchList">
    										$667.00
    								</td>
    							</tr>
    							<tr id="4001015searchList">
    								<td>4001015</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4001015">EXERCISE BIKES </a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4001015"
        rel="-ajax-lightbox-4001015"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4001015/69406911"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4001015searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4001015searchList" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4001015, "4001015searchList",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4001015searchList">
    										$150.00
    								</td>
    							</tr>
    							<tr id="4001012searchList">
    								<td>4001012</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4001012">TURF SPREADERS</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4001012"
        rel="-ajax-lightbox-4001012"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4001012/69605572"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4001012searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4001012searchList" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4001012, "4001012searchList",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4001012searchList">
    										$50.00
    								</td>
    							</tr>
    							<tr id="3991793searchList">
    								<td>3991793</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3991793">Electric Backpack Leaf Blower</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3991793"
        rel="-ajax-lightbox-3991793"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3991793/69528872"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3991793searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3991793searchList" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3991793, "3991793searchList",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3991793searchList">
    										$50.00
    								</td>
    							</tr>
    							<tr id="3996607searchList">
    								<td>3996607</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3996607">HP Toner Cartridges</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3996607"
        rel="-ajax-lightbox-3996607"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3996607/69626235"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3996607searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3996607searchList" class="">
    				3 days 16 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3996607, "3996607searchList",
    			1778212888297, 1778533200000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3996607searchList">
    										$26.00
    								</td>
    							</tr>
    							<tr id="4001725searchList">
    								<td>4001725</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4001725">Grizzly Bandsaw</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4001725"
        rel="-ajax-lightbox-4001725"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4001725/69376856"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4001725searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4001725searchList" class="">
    				3 days 22 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4001725, "4001725searchList",
    			1778212888297, 1778554800000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4001725searchList">
    										$53.00
    								</td>
    							</tr>
    							<tr id="4000491searchList">
    								<td>4000491</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4000491">Logitech Blue Microphone Snowball</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000491"
        rel="-ajax-lightbox-4000491"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000491/67774517"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000491searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000491searchList" class="">
    				3 days 22 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000491, "4000491searchList",
    			1778212888297, 1778554800000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000491searchList">
    										$10.00
    								</td>
    							</tr>
    							<tr id="4000492searchList">
    								<td>4000492</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=4000492">Dishwasher</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=4000492"
        rel="-ajax-lightbox-4000492"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/4000492/67871500"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft4000492searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue4000492searchList" class="">
    				3 days 22 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 4000492, "4000492searchList",
    			1778212888297, 1778554800000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_4000492searchList">
    										$20.00
    								</td>
    							</tr>
    							<tr id="3965208searchList">
    								<td>3965208</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3965208">2015 Toro Zero Turn Mower w/52&quot; Deck</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3965208"
        rel="-ajax-lightbox-3965208"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3965208/68932334"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3965208searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3965208searchList" class="">
    				4 days 15 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3965208, "3965208searchList",
    			1778212888297, 1778616000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3965208searchList">
    										$504.00
    								</td>
    							</tr>
    							<tr id="3979516searchList">
    								<td>3979516</td>
    								<td class="text-start">
    									<a href="/sms/all,co/auction/view?auc=3979516">2012 Toro Zero Turn Mower w/52&quot; Deck</a>















    								</td>
    								<td class="text-center">
        <div class="auction-thumbnail">
    <a href="/sms/all,co/auction/ajaxpicloader?auctionId=3979516"
        rel="-ajax-lightbox-3979516"
        onClick="alert('Please wait for the page to complete loading and try again.'); event.preventDefault();"
    >
                <div class="position-relative auction-thumbnail-lazy-container lazy-loading-container-loader">
                   <img
                       class="lazy-img-loading lazy-img-loading--table"
                       loading="lazy"
                       src="https://d37qv0n5b4mbzm.cloudfront.net/sms/docviewer/cdnmainaucdoc/thumb-b/3979516/69546905"
                       title=""
                       alt="View Images"
                    />

<div class="loading-spinner lazy-loading-icon" style="top: 30%; right: 30%;" role="status" aria-hidden="true">
<div class="load-spinner__roller">
<div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div><div><div></div></div>
</div>
</div>                </div>
    </a>
        </div>

    								</td>
    								<td class="text-center text-success fw-bold">
    									CO
    								</td>
    								<td nowrap>
    <div id="timeLeft3979516searchList" class="d-inline w-100 auction-time_left">
    		<span id="timeLeftValue3979516searchList" class="">
    				4 days 15 hours
    		</span>
    </div>

    	<script>
    		updateTimeLeftSpan(timeLeftInfoMap, 3979516, "3979516searchList",
    			1778212888297, 1778616000000, 0, "",
    			"", "searchGrid" , timeLeftCallback);
    	</script>
    								</td>
    								<td class="text-end pe-4" id="val_3979516searchList">
    										$504.00
    								</td>
    							</tr>
    					</tbody>
    				</table>
    			</div>

    			<div class="w-100 mb-2">
    				<div id="hideShowImages" style="display: none">
    <div class="d-flex justify-content-end me-2">
    	[
    		<span class="a me-2" role="button" onclick="listimg('n');">
    			Hide Images
    		</span>
    		|
    		<span class="a disabled ms-2">
    			Show Images
    		</span>
    	]
    </div>

</div>
	<div class="ajax-loading-pagination">
			<div class="d-flex justify-content-center align-items-center mt-2">
					<span class="fw-bold a disabled me-2">
						<span class="small">&laquo;</span>
					</span>
					<span class="fw-bold a disabled me-2">
					   <span class="small me-1">&#139;</span>Prev
					</span>
					<strong class="me-2">
						1
					</strong>
								<span class="me-2" role="button" onclick="srchPage('1');">
						2
					</span>
			&nbsp;
				<span class="fw-bold me-2" role="button" onclick="srchPage('1');">
					 Next<span class="small ms-1">&#155;</span>
				</span>
				<span class="fw-bold me-2" role="button" onclick="srchPage('1');">
					<span class="small">&raquo;</span>
				</span>
		  </div>
	</div>

    			</div>
    		<div class="text-center w-100 my-4 d-none" id="noAuctionsFound">
    			No auctions found
    		</div>
    	</div>

                </main>

                    <footer>
                        <div style="clear:left;">
    <div class="d-none d-md-flex ps-border-top-gross d-print-none"></div>

    <div class="d-none d-md-flex ps-main-bar d-print-none">
        <div class="left-sidebar"></div>
        <div class="right-sidebar"></div>
    </div>

    <div class="ps-footer-line-slim d-md-none d-print-none"></div>

    <div class="d-flex justify-content-center flex-wrap ps-footer-info mt-3 d-print-none">
        Customer Support:&nbsp            <a href="mailto:support@publicsurplus.com">support@publicsurplus.com</a>
         |

        Copyright 1999-2026 The Public Group, LLC.
            |
        All rights reserved.
    </div>

    <div class="d-flex justify-content-center pt-2">
        <img src="/sms/20240825/images/logoGroup_footer.png"
                                          alt="The Public Group"/>
    </div>

</div>
                    </footer>
            </div>

<div style='width:100%; display: none;' id="cookiesAcceptedDiv">
    <div class="message-container">
        <h2>
            This website uses cookies to ensure you get the best experience on our website. Please accept cookies for optimal performance.
        </h2>
    </div>
    <div class="container-button">
        <button type="button" class="ps-button" color="light" onclick="acceptCookies();">
            Yes, I Accept Cookies
        </button>
        <button
                class="ps-button mx-4" color="link"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#iframeModal"
                onclick="iframeModalBootstrap('iframeModal', '/sms/all,co/help/public/privacy.html');"
        >
            [
            Public Surplus Privacy Policy
            ]
        </button>
        <button
                class="ps-button" color="link"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#iframeModal"
                onclick="iframeModalBootstrap('iframeModal', '/sms/all,co/help/public/info_cookies.ftlh');"
        >
            [
            How to manage the cookies
            ]
        </button>
    </div>
</div>

        </body>

        <script type="text/javascript">
            function hideIconTooltip(icon){
    	var tooltip = bootstrap.Tooltip.getInstance(icon);
    	if(tooltip) {
    		tooltip.hide();
    	}
    }

    function disposeIconTooltip(icon){
    	var tooltip = bootstrap.Tooltip.getInstance(icon);
    	if(tooltip) {
    		tooltip.dispose();
    	}
    }

    function reactivateTooltipAfterIconChange(icon) {
    	var parent = icon.parentElement;
    	if (parent && parent.tagName === 'BUTTON') {
    		//if the tooltip is visible, the tooltip is hidden before changing the current icon
    		parent.addEventListener("click", (event) => hideIconTooltip(icon));
    		//after call ajax function, detects if there is a change in the button icon and reactivates the tooltip on the new icon
    		var observer = new MutationObserver(function(mutationsList, observer) {
    			mutationsList.forEach(mutation => {
    				if (mutation.type === 'childList') {
    					var newIcon = parent.querySelector('[data-bs-custom-class*="icon-tooltip"]');
    					bootstrap.Tooltip.getOrCreateInstance(newIcon);
    					parent.addEventListener("click", (event) => hideIconTooltip(newIcon));
    				}
    			});
    		});
    		var config = { childList: true };
    		observer.observe(parent, config);
    	} else if (parent) {
    		icon.addEventListener("click", (event) => hideIconTooltip(icon));
    	}
    }

    function activateIconTooltips() {
    	document.querySelectorAll('[data-bs-custom-class*="icon-tooltip"]').forEach(icon => {
    		activateIconTooltip(icon);
    	});
    }

    function activateIconTooltip(icon) {
    	bootstrap.Tooltip.getOrCreateInstance(icon);
    	reactivateTooltipAfterIconChange(icon);
    }

    if (document.addEventListener) {
    	document.addEventListener("DOMContentLoaded", (event) => {
    		activateIconTooltips();
    	});
    }
        </script>
    </html>
