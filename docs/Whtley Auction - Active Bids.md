# ** Active Bid Management**

**The following documentation outlines how Whitley Auction manages active bids, Won, Lost, Outbid & Winning, etc**

- The snippet below contains an export of data from Whitley Auction "Watchlist" page. This is where any item that the user has bid on in which the auction is still currently active is tracked
    <script>
            window.__APP_TOKEN__ = "eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3Nzg4Nzg2NjQsImFwcCI6ImZyb250In0.K5YY5z7hD1TFHZIUheX9J2OFjY9SfINI2yzVhZyPGL8";
        </script>
        <script>
            window.REDUX_DATA = {
                "auth": {
                    "session_token": "auth:eyJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE3Nzg5NzYyMTEsInVzZXJfaWQiOiI1MTk2NzgiLCJ0b2tlbiI6IjdZYTBFbzMwTWFJWC0wTXZsOF85SjJSeSJ9.gRxdVDY7bsMNpKt0IymiifvRWJOW5I-jH71Dne6xDWc",
                    "user": {
                        "user_id": "519678",  #This is for our user and contains the USER ID of the currently logged in user. - This ID is also used to indentify the current winning user of a active bid.
                        "user_ref": "15221",
                        "first_name": "Kevin",
                        "last_name": "Froelich",
                        "username": "k1989f@gmail.com",
                        "bidder_number": null,
                        "vip_bidder_number": null,
                        "email": "info@2ndbyte.shop",
                        "mfa_settings": null,
                        "created_at": "2026-05-08T02:24:25.141Z",
                        "status": 100,
                        "is_bidding_disabled": false,
                        "banned_message": null,
                        "banned_at": null,
                        "override_require_cc_to_bid": false,
                        "override_require_approval_to_bid": false,
                        "override_require_payment_auth_to_bid": false,
                        "override_require_text_verification_to_bid": null,
                        "affiliate_id": -1,
                        "affiliate_ids": null,
                        "can_edit_settings": false,
                        "is_incomplete": false,
                        "bidding_threshold": null,
                        "enable_logrocket": false,
                        "email_verified": true,
                        "optout_text_reminder": null,
                        "login_attempt_notification_count": null,
                        "can_create_auction_front": null,
                        "allowed_auction_types": null,
                        "is_bidder_agent": null,
                        "roles": [{
                            "role_id": "2"
                        }],
                        "subroles": ["2"],
                        "texting_verification": false,
                        "affiliate_allowed_auction_types": null,
                        "affiliate_allowed_consignor_ids": null,
                        "affiliateSomewhere": false,
                        "auction_status_access": null,
                        "details": {}
                    }
                },
                "affiliateDomain": {
                    "is_default": true,
                    "hostname": "www.whitleyauction.com",
                    "affiliate_id": null,
                    "affiliate_key": null,
                    "per_affiliate_fields": null
                },
                "serverTime": false,
                "extendedServerTime": false,
                "registrationUser": false,
                "registrationCard": false,
                "pageNotFound": false,
                "sidebarToggle": true,
                "tableHiddenFields": {},
                "lastLotListPage": "/account/watchlist?page=1&pageSize=25&search=&filter%5Blist_type%5D=watchlist&sort%5B0%5D%5Bc%5D=sale_order&sort%5B0%5D%5Bd%5D=asc&sort%5B1%5D%5Bc%5D=lot_number&sort%5B1%5D%5Bd%5D=asc",
                "lastViewedLotId": null,
                "logos": {
                    "logo.admin": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2020/12/80KE38JPsAUb6mRNBSpcQyX7.png",
                    "logo.home": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2020/12/ay7AoIV4-649-KxHgBbAFgNf.jpg",
                    "logo.print": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2020/12/tzvqwlmb0MOVPhkAz8nZtNTe.jpg",
                    "logo.dark": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2020/12/hiyY7x6bs1QK39bMWcfZjod2.jpg",
                    "logo.light": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2020/12/k4XsbEWxWj7eeq6ZrtLs4Dhw.jpg"
                },
                "currencyFormat": {
                    "long": {
                        "prefix": "$",
                        "separator": ",",
                        "decimal_separator": "."
                    },
                    "short": {
                        "prefix": "$",
                        "separator": ",",
                        "decimal_separator": "."
                    }
                },
                "urlSettings": {
                    "auction_lot": {},
                    "auction": {},
                    "item_group_lot": {},
                    "item_group": {}
                },
                "companyInfo": {
                    "name": "Rocky Mountain Estate Brokers Inc.",
                    "phone": "+19704541010",
                    "address": {
                        "zip": "80615",
                        "city": "Eaton",
                        "state": {
                            "state_id": 6,
                            "state_name": "Colorado"
                        },
                        "line_1": "24 Oak Avenue",
                        "country": {
                            "id": "236",
                            "code": "US",
                            "name": "United States"
                        }
                    },
                    "timezone": "US/Mountain"
                },
                "header": {
                    "show_login_icon": false,
                    "slider_in_header": false,
                    "slider_in_header_homepage_only": true
                },
                "lotListDisplayStyle": "grid",
                "auctionListDisplayStyle": null,
                "auctionToRegister": null,
                "logRocket": {
                    "key": "j8tq9s/auctioneer-software",
                    "enabled": false,
                    "include_anonymous_sessions": false
                },
                "biddingRequirements": {
                    "user_has_active_cc": true,
                    "user_has_verified_email": true,
                    "user_has_verified_phone": false,
                    "override_require_cc_to_bid": false,
                    "override_require_payment_auth_to_bid": false,
                    "override_require_text_verification_to_bid": false,
                    "override_require_heard_about_list_to_bid": false,
                    "override_require_auction_platform_fee": false,
                    "user_has_verified_drivers_license": false
                },
                "biddingBoxSettings": {
                    "requireAuthSetting": true,
                    "canSaveDeposit": true,
                    "canDepositAuctionRegFee": false,
                    "verifyEmailToBid": true,
                    "verifyPhoneToBid": null,
                    "ccRequiredToBid": true,
                    "enable_online_prebidding": false,
                    "ccPaymentKey": "AuthorizeNet",
                    "requireHeardAboutList": null
                },
                "toastSettings": {
                    "stacked": false,
                    "theme": "colored",
                    "enableIcons": false
                },
                "userPermissions": {}
            };
        </script>
        <script>
            window.__APOLLO_STATE__ = {
                "User.519678": {
                    "__typename": "User",
                    "user_id": "519678",
                    "override_require_cc_to_bid": false,
                    "override_require_payment_auth_to_bid": false,
                    "drivers_license_verified": null,
                    "override_require_text_verification_to_bid": null,
                    "override_require_heard_about_list_to_bid": null,
                    "override_require_auction_platform_fee": null,
                    "email_verified": true,
                    "texting_verification": false,
                    "file_upload_expires_at": null
                },
                "ROOT_QUERY": {
                    "__typename": "Query",
                    "myCreditCards({})": {
                        "__typename": "CreditCardSearchResult",
                        "total": 1,
                        "cards": [{
                            "__typename": "CreditCard",
                            "credit_card_id": "236409",
                            "expiration_date": "2030-08-01T00:00:00.000Z"
                        }]
                    },
                    "myUser": {
                        "__ref": "User.519678"
                    },
                    "setting({\"setting_key\":\"website.scripts\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "body_scripts": "\u003c!-- Begin Constant Contact Active Forms -->\n\u003cscript> var _ctct_m = \"84555b2270e638aab7756af3acebb81d\"; \u003c/script>\n\u003cscript id=\"signupScript\" src=\"//static.ctctcdn.com/js/signup-form-widget/current/signup-form-widget.min.js\" async defer>\u003c/script>\n\u003c!-- End Constant Contact Active Forms -->\n\u003cstyle>\n@media (max-width: 800px) { body #app .list .lotList .lot {\nwidth: 145px;\n}}\n@media (max-width: 800px) { body #app .list .lotList .lot .imgWrapper .imgContainer {\nwidth: 145px;\n}}\n@media (max-width: 800px) { body #app .list .lotList .lot .details {\ndisplay: flex;\nflex-direction: column;\nmargin: 10px 5px 0;\n}}\n@media (max-width: 800px) { body #app .list .lotList .lot .details .time-remaining {\nwidth: 135px;\nfont-size: 14px;\n}}\n\n\u003c/style>",
                            "footer_scripts": "",
                            "head_scripts": "\u003c!-- Global site tag (gtag.js) - Google Analytics -->\n\u003cscript async src=\"https://www.googletagmanager.com/gtag/js?id=UA-52050251-1\">\u003c/script>\n\u003cscript>\nwindow.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', 'UA-52050251-1');\n\u003c/script>\n\n\u003c!-- Facebook Pixel Code -->\n\u003cscript>\n!function(f,b,e,v,n,t,s)\n{if(f.fbq)return;n=f.fbq=function(){n.callMethod?\nn.callMethod.apply(n,arguments):n.queue.push(arguments)};\nif(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';\nn.queue=[];t=b.createElement(e);t.async=!0;\nt.src=v;s=b.getElementsByTagName(e)[0];\ns.parentNode.insertBefore(t,s)}(window, document,'script',\n'https://connect.facebook.net/en_US/fbevents.js');\nfbq('init', '472045636322848');\nfbq('track', 'PageView');\n\u003c/script>\n\u003cnoscript>\u003cimg height=\"1\" width=\"1\" style=\"display:none\"\nsrc=\"https://www.facebook.com/tr?id=472045636322848&ev=PageView&noscript=1\"\n/>\u003c/noscript>\n\u003c!-- End Facebook Pixel Code -->\n\n\u003cstyle>\n  #app-body #homepage-slider {\n    max-width: 1110px;\n    width: 100%;\n    margin: 0 auto;\n  }\n  #main-content footer#main-footer .text-above-menu {\n    max-width: 600px;\n    width: 100%;\n  }\n  #main-content footer#main-footer .text-above-menu img {\n    max-width: 456px;\n    width: 100%;\n    margin-bottom: 16px;\n  }\n  #main-content footer#main-footer .footer-content-above-menu {\n    max-width: unset;\n  }\n  #main-content footer#main-footer .bottomFooter {\n    flex-flow: column nowrap;\n    align-items: center;\n    font-size: 14px;\n  }\n  footer#main-footer .bottomFooter > div {\n    display: none;\n  }\nfooter#main-footer .text-below-menu {\n     text-align: center;\n     font-size: 14px;\n     order: 1;\n}\nfooter#main-footer .text-below-menu p {\n     margin-bottom: 0px;\n}\n  #app-body .lotList .lot .details .lot-title {\n    word-break: break-word;\n  }\n\u003c/style>"
                        }
                    },
                    "setting({\"setting_key\":\"affiliates.shared_scripts\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {}
                    },
                    "front_footer_logos": [{
                        "__typename": "Attachment",
                        "attachment_id": "905791",
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/vWaCr8BelBPnlkVAqMeTbice.tif",
                        "title": "NAA_new_logo_blue[1].tif",
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/large/vWaCr8BelBPnlkVAqMeTbice.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/medium/vWaCr8BelBPnlkVAqMeTbice.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/small/vWaCr8BelBPnlkVAqMeTbice.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/thumb/vWaCr8BelBPnlkVAqMeTbice.jpeg"
                        }],
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "link_to": "https://www.auctioneers.org/"
                        },
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/905791/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/905791/small",
                            "medium": "https://www.whitleyauction.com/asset/image/905791/medium",
                            "large": "https://www.whitleyauction.com/asset/image/905791/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "attachment_id": "905782",
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/WeqEH1OSVr7zzQ7Ro4VsZ1Cv.jpg",
                        "title": "CAA-Logo_Dark[1].jpg",
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/large/WeqEH1OSVr7zzQ7Ro4VsZ1Cv.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/medium/WeqEH1OSVr7zzQ7Ro4VsZ1Cv.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/small/WeqEH1OSVr7zzQ7Ro4VsZ1Cv.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/thumb/WeqEH1OSVr7zzQ7Ro4VsZ1Cv.jpeg"
                        }],
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "link_to": "https://www.coauctioneers.com/"
                        },
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/905782/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/905782/small",
                            "medium": "https://www.whitleyauction.com/asset/image/905782/medium",
                            "large": "https://www.whitleyauction.com/asset/image/905782/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "attachment_id": "905790",
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/C1KfJm-863q-8BB_W18A-hix.png",
                        "title": "logo[1].png",
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/large/C1KfJm-863q-8BB_W18A-hix.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/medium/C1KfJm-863q-8BB_W18A-hix.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/small/C1KfJm-863q-8BB_W18A-hix.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/thumb/C1KfJm-863q-8BB_W18A-hix.jpeg"
                        }],
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "link_to": "https://www.wyoauctioneers.org/"
                        },
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/905790/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/905790/small",
                            "medium": "https://www.whitleyauction.com/asset/image/905790/medium",
                            "large": "https://www.whitleyauction.com/asset/image/905790/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "attachment_id": "905788",
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/44lSSkiGp8Ptv5Wj3YdBCsNJ.jpg",
                        "title": "CAI_Badge[1].jpg",
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/large/44lSSkiGp8Ptv5Wj3YdBCsNJ.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/medium/44lSSkiGp8Ptv5Wj3YdBCsNJ.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/small/44lSSkiGp8Ptv5Wj3YdBCsNJ.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/thumb/44lSSkiGp8Ptv5Wj3YdBCsNJ.jpeg"
                        }],
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "link_to": "https://bcert.me/bc/html/profile.jsp?k=nsyisey"
                        },
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/905788/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/905788/small",
                            "medium": "https://www.whitleyauction.com/asset/image/905788/medium",
                            "large": "https://www.whitleyauction.com/asset/image/905788/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "attachment_id": "905789",
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/zth0-WviHFvJ-Uv-QbynT1gJ.jpg",
                        "title": "CES_Badge[1].jpg",
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/large/zth0-WviHFvJ-Uv-QbynT1gJ.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/medium/zth0-WviHFvJ-Uv-QbynT1gJ.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/small/zth0-WviHFvJ-Uv-QbynT1gJ.jpeg"
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2021/1/thumb/zth0-WviHFvJ-Uv-QbynT1gJ.jpeg"
                        }],
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "link_to": "https://bcert.me/bc/html/profile.jsp?k=nygwedq"
                        },
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/905789/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/905789/small",
                            "medium": "https://www.whitleyauction.com/asset/image/905789/medium",
                            "large": "https://www.whitleyauction.com/asset/image/905789/large"
                        }
                    }],
                    "menuItems({\"menu_tag\":\"main-menu\"})": [{
                        "__typename": "MenuItem",
                        "menu_item_id": "17",
                        "parent_id": null,
                        "display_label": "UPCOMING AUCTIONS",
                        "custom_url": "/auction-calendar",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "34",
                        "parent_id": null,
                        "display_label": "PAST AUCTIONS",
                        "custom_url": "/past-auctions",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "19",
                        "parent_id": null,
                        "display_label": "SELL WITH US",
                        "custom_url": "/sell-with-us",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "20",
                        "parent_id": null,
                        "display_label": "BUY WITH US",
                        "custom_url": "/buy-with-us",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "18",
                        "parent_id": null,
                        "display_label": "REAL ESTATE",
                        "custom_url": "/real-estate-sale",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "21",
                        "parent_id": null,
                        "display_label": "CONTACT COLORADO AUCTION COMPANY",
                        "custom_url": "/contact-colorado-auction-company",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "24",
                        "parent_id": null,
                        "display_label": "RMEB AUCTION HOME",
                        "custom_url": "/",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }],
                    "setting({\"setting_key\":\"website.contact_form\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "ask_if_receive_future_emails": true,
                            "email_placeholder": "",
                            "message_for_successful_submission": "\u003cp>\u003cstrong>Thank you for contacting Rocky Mountain Estate Brokers Inc.&nbsp;&nbsp;\u003c/strong>We will get back to you as soon as possible.&nbsp;\u003c/p>\n\u003chr />\n\u003cp>Rocky Mountain Estate Brokers Inc.\u003c/p>\n\u003cp>Rocky Mountain Estate Brokers Realty LLC&nbsp;\u003c/p>\n\u003cp>Professional Auctioneers, Innovative Technologies.\u003c/p>\n\u003cp>www.whitleyauction.com\u003c/p>\n\u003cp>970-454-1010\u003c/p>",
                            "name_placeholder": "",
                            "phone_placeholder": "",
                            "split_name_into_first_and_last": true
                        }
                    },
                    "settings({\"setting_keys\":[\"website.super_admin_settings.enable_text_verification_popup\"]})": {
                        "website": {
                            "super_admin_settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"website.super_admin_settings.enable_pwa\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"company.general.phone\",\"website.links\"]})": {
                        "website": {
                            "links": {}
                        },
                        "company": {
                            "general": {
                                "phone": "+19704541010"
                            }
                        }
                    },
                    "settings({\"setting_keys\":[\"website.general.scroll_top_button_visible\"]})": {
                        "website": {
                            "general": {
                                "scroll_top_button_visible": true
                            }
                        }
                    },
                    "setting({\"setting_key\":\"website.footer.text_below_menu.content\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": "\u003cp>Copyright &copy; 2021-2025 &bull; Rocky Mountain Estate Brokers, Inc.\u003c/p>\n\u003cp>All Rights Reserved.\u003c/p>"
                    },
                    "menuItems({\"menu_tag\":\"footer-menu\"})": [{
                        "__typename": "MenuItem",
                        "menu_item_id": "7",
                        "parent_id": null,
                        "display_label": "Quick Links",
                        "custom_url": "",
                        "is_internal": false,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "31",
                        "parent_id": "7",
                        "display_label": "RMEB AUCTION HOME",
                        "custom_url": "/",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "8",
                        "parent_id": "7",
                        "display_label": "Auctions",
                        "custom_url": "/auctions",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "28",
                        "parent_id": "7",
                        "display_label": "Sell With Us",
                        "custom_url": "/sell-with-us",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "29",
                        "parent_id": "7",
                        "display_label": "Real Estate",
                        "custom_url": "/real-estate-sale",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "30",
                        "parent_id": "7",
                        "display_label": "Contact Colorado Auction Company",
                        "custom_url": "/contact-colorado-auction-company",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "13",
                        "parent_id": null,
                        "display_label": "Other Information",
                        "custom_url": "",
                        "is_internal": false,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "15",
                        "parent_id": "13",
                        "display_label": "Terms Of Service",
                        "custom_url": "/terms",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "14",
                        "parent_id": "13",
                        "display_label": "Privacy Policy",
                        "custom_url": "/privacy",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "27",
                        "parent_id": "13",
                        "display_label": "Accessibility Policy",
                        "custom_url": "/accessibility-policy",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }],
                    "settings({\"setting_keys\":[\"website.super_admin_settings.display_snd_footer\",\"website.social_media\"]})": {
                        "website": {
                            "social_media": {
                                "enable_share_to_button": true,
                                "facebook_link": "https://www.facebook.com/coloradoauctioneer",
                                "files": null,
                                "instagram_link": null,
                                "linkedin_link": "https://www.linkedin.com/in/rmeb-inc-whitley-auction-aba63823/",
                                "open_new_tab": true,
                                "options": ["facebook", "twitter", "pinterest", "linkedin"],
                                "pinterest_link": null,
                                "shape": null,
                                "show_share_buttons_on_account_bar": false,
                                "show_social_media_links_on_account_bar": true,
                                "show_social_media_links_on_footer": null,
                                "size": null,
                                "social-media-preview": null,
                                "tiktok_link": null,
                                "twitter_link": "https://twitter.com/whitleyauction",
                                "vimeo_link": null,
                                "whatsapp_link": null,
                                "youtube_link": "https://www.youtube.com/channel/UCod-FEjp8IccutW95QUta8A"
                            },
                            "super_admin_settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"integrations.newsletter\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "key": "ConstantContact",
                            "include_in_registration": true,
                            "include_in_footer": true
                        }
                    },
                    "setting({\"setting_key\":\"company.general.name\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": "Rocky Mountain Estate Brokers Inc."
                    },
                    "menuItems({\"menu_tag\":\"account-menu\"})": [{
                        "__typename": "MenuItem",
                        "menu_item_id": "2",
                        "parent_id": null,
                        "display_label": "Account",
                        "custom_url": "/account",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "3",
                        "parent_id": null,
                        "display_label": "Watchlist",
                        "custom_url": "/account/watchlist",
                        "is_internal": true,
                        "special_link": null,
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }, {
                        "__typename": "MenuItem",
                        "menu_item_id": "5",
                        "parent_id": null,
                        "display_label": "Logout",
                        "custom_url": "",
                        "is_internal": true,
                        "special_link": "logout",
                        "display_as_user_name": null,
                        "target": null,
                        "classes": null,
                        "cms_page_id": null
                    }],
                    "setting({\"setting_key\":\"website.pwa\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.social_media\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "enable_share_to_button": true,
                            "facebook_link": "https://www.facebook.com/coloradoauctioneer",
                            "files": null,
                            "instagram_link": null,
                            "linkedin_link": "https://www.linkedin.com/in/rmeb-inc-whitley-auction-aba63823/",
                            "open_new_tab": true,
                            "options": ["facebook", "twitter", "pinterest", "linkedin"],
                            "pinterest_link": null,
                            "shape": null,
                            "show_share_buttons_on_account_bar": false,
                            "show_social_media_links_on_account_bar": true,
                            "show_social_media_links_on_footer": null,
                            "size": null,
                            "social-media-preview": null,
                            "tiktok_link": null,
                            "twitter_link": "https://twitter.com/whitleyauction",
                            "vimeo_link": null,
                            "whatsapp_link": null,
                            "youtube_link": "https://www.youtube.com/channel/UCod-FEjp8IccutW95QUta8A"
                        }
                    },
                    "settings({\"setting_keys\":[\"website.super_admin_settings.allow_id_scanner_on_front\"]})": {
                        "website": {
                            "super_admin_settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"website.super_admin_settings.user_account_display_mode\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.footer.text_above_menu.content\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": "\u003cp style=\"text-align: center;\">An Award-Winning Colorado &amp; Wyoming Auction Company.\u003cbr />Certified, Champion Auctioneers.\u003cbr />We conduct successful online auctions, estate sales and business liquidations.\u003cbr />\u003cspan style=\"text-decoration: underline;\">\u003cstrong>Real Estate Auctions &amp; Sales\u003c/strong>\u003c/span>\u003cbr />\u003cstrong>Eaton Auction Center\u003cbr />\u003c/strong>970-454-1010\u003cbr />24 Oak Avenue, Eaton Colorado, 80615\u003cbr />\u003cstrong>Fort Collins, Colorado\u003c/strong>: 970-224-2050\u003cbr />\u003cstrong>Denver/Boulder Metro: \u003c/strong>303-661-0202\u003c/p>\n\u003cp style=\"text-align: left;\">\u003cimg style=\"display: block; margin-left: auto; margin-right: auto;\" src=\"https://auctioneersoftware.s3.amazonaws.com/rmeb/2021/2/lp0mao04fmG63jtA0UgACAXr.jpg\" />\u003c/p>\n\u003cp style=\"text-align: justify;\">We help you solve problems. Rocky Mountain Estate Brokers Inc. is a leading Colorado and Wyoming auction company. RMEB Inc. Whitley Auction conducts auctions, estate sales and business liquidations in Denver, Fort Collins, Boulder, Greeley, Cheyenne, Loveland, Longmont and other cities and towns throughout Colorado, Wyoming, and the Rocky Mountain Region. We also sell and auction real estate through Rocky Mountain Estate Brokers Realty LLC. Our auctioneers will professionally conduct your auction, estate sale or liquidation at your location or ours. We also conduct live and online auctions at our Eaton Auction Center that serves as a massive regional auction house.\u003c/p>\n\u003cp style=\"text-align: center;\">David P. Whitley CAI, CES Auctioneer\u003cbr />Catherine &ldquo;Casey&rdquo; Giddings CAI Auctioneer\u003c/p>"
                    },
                    "setting({\"setting_key\":\"website.social_media.open_new_tab\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": true
                    },
                    "setting({\"setting_key\":\"integrations.recaptcha\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {}
                    },
                    "setting({\"setting_key\":\"integrations.payment.credit\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "key": "AuthorizeNet",
                            "cvv_mode": "on_add_card",
                            "settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"integrations.payment.ach\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"users.super_admin_settings\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "allow_user_notes": true,
                            "login_with_email": true,
                            "password_validation": "zxcvbn",
                            "show_user_bid_totals": true,
                            "zxcvbn_minimum_score": 3,
                            "enable_confirmation_modal_for_duplicate_email": false
                        }
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.allow_affiliates\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": false
                    },
                    "setting({\"setting_key\":\"item_groups.super_admin_settings.enable_cart\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"users.consignor_portal.label_for_auction_listings\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.general.label_for_lot\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.allow_affiliate_front_registration\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.alerts.user\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {}
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.enable_document_signing\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"integrations.embed.signing.key\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"users.super_admin_settings.enable_user_active_bid_totals\",\"auctions.super_admin_settings\"]})": {
                        "auctions": {
                            "super_admin_settings": {
                                "auction_types": ["online", "live", "multipar", "real-estate-listing"],
                                "barcode_upload": true,
                                "filename_upload": true,
                                "allow_affiliates": false,
                                "enable_image_tag": true,
                                "lot_list_display": "toggle",
                                "enable_sale_order": true,
                                "allow_editing_bids": true,
                                "allow_enable_landing": true,
                                "auction_list_display": ["box"],
                                "enable_global_reports": false,
                                "skip_auction_lot_list": true,
                                "enable_payment_deposit": true,
                                "multipar_display_board": false,
                                "enable_auction_info_box": true,
                                "allow_auction_categories": true,
                                "allow_lot_photo_download": true,
                                "lot_list_display_default": "grid",
                                "allow_hiding_winning_info": true,
                                "allow_admin_bid_for_bidders": true,
                                "allow_specific_bidder_number": true,
                                "enable_payment_authorization": true,
                                "enable_global_invoices_report": false,
                                "allow_batch_cc_charging_invoices": true,
                                "auto_load_more_lots_when_closing": true,
                                "simulcast_auction_display_screen": true,
                                "enable_global_pickup_status_report": false,
                                "enable_auction_pickup_status_report": false,
                                "enable_global_lots_cataloged_report": false,
                                "allow_uploading_lot_photos_on_create": true,
                                "simulcast_advanced_auctioneer_screen": true,
                                "enable_maxbid_notification_for_first_bid": true,
                                "simulcast_advanced_bidder_display_screen": true
                            }
                        },
                        "users": {
                            "super_admin_settings": {}
                        }
                    },
                    "lots({\"filter\":{\"is_visible\":true,\"is_watched\":true,\"page\":\"watchlist\"},\"filters\":{\"or\":[{\"auction_status\":{\"op\":\"eq\",\"value\":200}},{\"and\":[{\"auction_status\":{\"op\":\"eq\",\"value\":300}},{\"auction_end_time\":{\"op\":\"gte\",\"value\":\"2026-05-16T00:00:00.000Z\"}}]}]},\"order\":[{\"column\":\"priority_auction_status_order\",\"direction\":\"asc\"},{\"column\":\"sale_order\",\"direction\":\"asc\"},{\"column\":\"lot_number\",\"direction\":\"asc\"}],\"pagination\":{\"page\":1,\"pageSize\":25},\"search\":{\"text\":\"\"}})": {
                        "__typename": "AuctionLotSearchResult",
                        "total": 8,
                        "lots": [{
                            "__ref": "AuctionLot.332382"
                        }, {
                            "__ref": "AuctionLot.332427"
                        }, {
                            "__ref": "AuctionLot.332716"
                        }, {
                            "__ref": "AuctionLot.332714"
                        }, {
                            "__ref": "AuctionLot.329672"
                        }, {
                            "__ref": "AuctionLot.330181"
                        }, {
                            "__ref": "AuctionLot.332415"
                        }, {
                            "__ref": "AuctionLot.330205"
                        }]
                    },
                    "setting({\"setting_key\":\"auctions.defaults.display_watch_count_on_auction_lot\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "auction_types": ["online", "live", "multipar", "real-estate-listing"],
                            "barcode_upload": true,
                            "filename_upload": true,
                            "allow_affiliates": false,
                            "enable_image_tag": true,
                            "lot_list_display": "toggle",
                            "enable_sale_order": true,
                            "allow_editing_bids": true,
                            "allow_enable_landing": true,
                            "auction_list_display": ["box"],
                            "enable_global_reports": false,
                            "skip_auction_lot_list": true,
                            "enable_payment_deposit": true,
                            "multipar_display_board": false,
                            "enable_auction_info_box": true,
                            "allow_auction_categories": true,
                            "allow_lot_photo_download": true,
                            "lot_list_display_default": "grid",
                            "allow_hiding_winning_info": true,
                            "allow_admin_bid_for_bidders": true,
                            "allow_specific_bidder_number": true,
                            "enable_payment_authorization": true,
                            "enable_global_invoices_report": false,
                            "allow_batch_cc_charging_invoices": true,
                            "auto_load_more_lots_when_closing": true,
                            "simulcast_auction_display_screen": true,
                            "enable_global_pickup_status_report": false,
                            "enable_auction_pickup_status_report": false,
                            "enable_global_lots_cataloged_report": false,
                            "allow_uploading_lot_photos_on_create": true,
                            "simulcast_advanced_auctioneer_screen": true,
                            "enable_maxbid_notification_for_first_bid": true,
                            "simulcast_advanced_bidder_display_screen": true
                        }
                    },
                    "setting({\"setting_key\":\"auctions.bidding.incoming_bid_animation\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": "heartbeat"
                    },
                    "setting({\"setting_key\":\"website.lot_tiles\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "banner_text": {},
                            "tile_style": "two"
                        }
                    },
                    "setting({\"setting_key\":\"website.lot_list\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "enable_featured_lots_autoplay": true
                        }
                    },
                    "setting({\"setting_key\":\"users.super_admin_settings.button_text_for_watchlist_auction_link\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.lot_list_display_default\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": "grid"
                    },
                    "settings({\"setting_keys\":[\"users.super_admin_settings.allow_user_saving_search\"]})": {
                        "users": {
                            "super_admin_settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"auctions.defaults.display_search_results_summary\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.bid_sound.enable_bid_sound\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.enable_go_to_auction_lot_search\"]})": {
                        "auctions": {
                            "super_admin_settings": {}
                        }
                    },
                    "settings({\"setting_keys\":[\"auctions.general.show_total_lots_pagination\"]})": {
                        "auctions": {
                            "general": {}
                        }
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.hide_price_past_end_time\"]})": {
                        "auctions": {
                            "super_admin_settings": {}
                        }
                    },
                    "settings({\"setting_keys\":[\"auctions.defaults.display_starting_bid_when_no_bids\",\"auctions.bidding.enable_bid_premium_price_paid_on_front\",\"auctions.super_admin_settings.allow_non_multipar_unit_bidding\"]})": {
                        "auctions": {
                            "defaults": {
                                "display_starting_bid_when_no_bids": true
                            },
                            "bidding": {},
                            "super_admin_settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"website.lot_tiles.enable_lot_description_on_tiles\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.bidding_threshold\",\"auctions.super_admin_settings.allow_non_multipar_unit_bidding\"]})": {
                        "auctions": {
                            "super_admin_settings": {}
                        }
                    },
                    "bid_sounds": [],
                    "setting({\"setting_key\":\"auctions.general.hidden_times_text\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": "Times are Coming Soon"
                    },
                    "setting({\"setting_key\":\"website.bid_sound.play_sound_only_for_am_bidding_or_am_watching\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.enable_grouped_lots_tooltip\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"users.super_admin_settings.allow_user_notes\"]})": {
                        "users": {
                            "super_admin_settings": {
                                "allow_user_notes": true
                            }
                        }
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.display_location_lot_tile\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.super_admin_settings.enable_lot_video_modal\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.bidding_threshold\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.disable_lot_tiles_on_completed\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.lot_tiles.tile_bidding_style\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"website.lot_list.lots_per_page_options\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"users.super_admin_settings.show_user_bid_totals\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": true
                    },
                    "settings({\"setting_keys\":[\"website.lot_tiles.display_radial_timer_in_last_few_seconds\",\"website.lot_tiles.radial_timer_threshold_seconds\"]})": {
                        "website": {
                            "lot_tiles": {}
                        }
                    },
                    "setting({\"setting_key\":\"auctions.bidding.high_bidder_display_text\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.bidding.bid_button_display_mode\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.show_status_for_passed_and_no_sale_lots\",\"auctions.bidding.reserve_not_met_front_text\",\"auctions.bidding.reserve_met_front_text\",\"auctions.bidding.reserve_not_available_front_text\"]})": {
                        "auctions": {
                            "super_admin_settings": {},
                            "bidding": {}
                        }
                    },
                    "setting({\"setting_key\":\"website.lot_tiles.banner_text\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {}
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.enable_image_tag\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": true
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.display_lot_ref_on_front\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "setting({\"setting_key\":\"auctions.super_admin_settings.enable_image_rotation_lot_tiles\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": null
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.display_inventory_ref_lot_tile\",\"auctions.super_admin_settings.inventory_ref_front_label\"]})": {
                        "auctions": {
                            "super_admin_settings": {}
                        }
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.winning_bidder_display_flag\"]})": {
                        "auctions": {
                            "super_admin_settings": {}
                        }
                    },
                    "setting({\"setting_key\":\"auctions.general\"})": {
                        "__typename": "WebsiteSettingResult",
                        "setting": {
                            "hidden_times_text": "Times are Coming Soon",
                            "lot_staggering_type": "stagger_by_group",
                            "featured_lots_random_order": false,
                            "show_auction_end_time_in_info_box": true
                        }
                    },
                    "settings({\"setting_keys\":[\"auctions.super_admin_settings.enable_footer_auction_alerts\"]})": {
                        "auctions": {
                            "super_admin_settings": {}
                        }
                    },
                    "auction({\"auction_id\":\"29255\"})": {
                        "__ref": "Auction.29255"
                    }
                },
                "AuctionLot.332382": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "332382",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "",
                    "lot_number": "63",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Brand New Deco AX5400 Whole Home Mesh Wifi 6 System. Eliminates dead spots with 3 routers,  connects to over 150 devices & more.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:14:24.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 96.5,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678",
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2791",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2791",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 100
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 96.5
                    },
                    "bid_count": 24,
                    "bid_increment_amount": 5,
                    "required_bid": 101.5,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15631432,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                        "file_name": "H7ReT3Bubsgij5IkyHY6cWaI.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/large/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/medium/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/small/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/thumb/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                        "asset_metadata": {
                            "size": 1068797,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2025/10/YQcLDijSPpVsRMOu-M7oCkUC.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15631432/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15631432/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15631432/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631432/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 3,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "134814"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2025/10/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/large/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                            "asset_metadata": {
                                "size": 342761,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1590,
                                "extension": ".jpeg",
                                "destination": "2025/10/large/YQcLDijSPpVsRMOu-M7oCkUC.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/medium/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                            "asset_metadata": {
                                "size": 44452,
                                "type": "image/jpeg",
                                "width": 725,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2025/10/medium/YQcLDijSPpVsRMOu-M7oCkUC.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/small/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                            "asset_metadata": {
                                "size": 6706,
                                "type": "image/jpeg",
                                "width": 226,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2025/10/small/YQcLDijSPpVsRMOu-M7oCkUC.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/thumb/YQcLDijSPpVsRMOu-M7oCkUC.jpeg",
                            "asset_metadata": {
                                "size": 4814,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2025/10/thumb/YQcLDijSPpVsRMOu-M7oCkUC.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631432/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631432/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631432/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631432/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2025/9/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/9/large/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg",
                            "asset_metadata": {
                                "size": 251662,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1500,
                                "extension": ".jpeg",
                                "destination": "2025/9/large/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/9/medium/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg",
                            "asset_metadata": {
                                "size": 51919,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2025/9/medium/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/9/small/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg",
                            "asset_metadata": {
                                "size": 7478,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2025/9/small/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/9/thumb/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg",
                            "asset_metadata": {
                                "size": 4596,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2025/9/thumb/LM4ewcaDp_r9AvDTWub1MH4Q.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631433/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631433/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631433/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631433/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2025/10/FZTmid3ES64NP9Fi0q6KIwzM.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/large/FZTmid3ES64NP9Fi0q6KIwzM.jpeg",
                            "asset_metadata": {
                                "size": 328007,
                                "type": "image/jpeg",
                                "width": 1272,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2025/10/large/FZTmid3ES64NP9Fi0q6KIwzM.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/medium/FZTmid3ES64NP9Fi0q6KIwzM.jpeg",
                            "asset_metadata": {
                                "size": 24985,
                                "type": "image/jpeg",
                                "width": 366,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2025/10/medium/FZTmid3ES64NP9Fi0q6KIwzM.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/small/FZTmid3ES64NP9Fi0q6KIwzM.jpeg",
                            "asset_metadata": {
                                "size": 3612,
                                "type": "image/jpeg",
                                "width": 115,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2025/10/small/FZTmid3ES64NP9Fi0q6KIwzM.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2025/10/thumb/FZTmid3ES64NP9Fi0q6KIwzM.jpeg",
                            "asset_metadata": {
                                "size": 3583,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2025/10/thumb/FZTmid3ES64NP9Fi0q6KIwzM.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631434/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631434/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631434/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631434/large"
                        }
                    }]
                },
                "AuctionLot.332427": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "332427",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "",
                    "lot_number": "66",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Brand New Roomba Plus 4020 Combo Robot Vacuum & Mop with AutoWash Dock. This vacuums, mops, empties, washes & dries all on its own.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:15:00.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 195,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678", # This matches the USER ID outlined above and signifies that the user is currently winning this bid.
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2994",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2994",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 195
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 195
                    },
                    "bid_count": 50,
                    "bid_increment_amount": 5,
                    "required_bid": 200,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15631625,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                        "file_name": "IppCTai_VK8poHBKMlv-noyF.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                        "asset_metadata": {
                            "size": 534095,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/5/CXsoDi4MJkcsZz0j8hbyXESH.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15631625/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15631625/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15631625/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631625/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 5,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "160621"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                            "asset_metadata": {
                                "size": 222770,
                                "type": "image/jpeg",
                                "width": 1953,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/CXsoDi4MJkcsZz0j8hbyXESH.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                            "asset_metadata": {
                                "size": 32990,
                                "type": "image/jpeg",
                                "width": 563,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/CXsoDi4MJkcsZz0j8hbyXESH.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                            "asset_metadata": {
                                "size": 5549,
                                "type": "image/jpeg",
                                "width": 176,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/CXsoDi4MJkcsZz0j8hbyXESH.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/CXsoDi4MJkcsZz0j8hbyXESH.jpeg",
                            "asset_metadata": {
                                "size": 5426,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/CXsoDi4MJkcsZz0j8hbyXESH.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631625/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631625/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631625/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631625/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/MhiqrndaHmvlaJmdBtUHFvcC.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/MhiqrndaHmvlaJmdBtUHFvcC.jpeg",
                            "asset_metadata": {
                                "size": 184822,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1615,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/MhiqrndaHmvlaJmdBtUHFvcC.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/MhiqrndaHmvlaJmdBtUHFvcC.jpeg",
                            "asset_metadata": {
                                "size": 34688,
                                "type": "image/jpeg",
                                "width": 713,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/MhiqrndaHmvlaJmdBtUHFvcC.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/MhiqrndaHmvlaJmdBtUHFvcC.jpeg",
                            "asset_metadata": {
                                "size": 6386,
                                "type": "image/jpeg",
                                "width": 223,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/MhiqrndaHmvlaJmdBtUHFvcC.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/MhiqrndaHmvlaJmdBtUHFvcC.jpeg",
                            "asset_metadata": {
                                "size": 4570,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/MhiqrndaHmvlaJmdBtUHFvcC.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631626/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631626/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631626/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631626/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/yLgJAiVsSgRp54-MlMmcfYup.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/yLgJAiVsSgRp54-MlMmcfYup.jpeg",
                            "asset_metadata": {
                                "size": 260885,
                                "type": "image/jpeg",
                                "width": 1748,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/yLgJAiVsSgRp54-MlMmcfYup.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/yLgJAiVsSgRp54-MlMmcfYup.jpeg",
                            "asset_metadata": {
                                "size": 37032,
                                "type": "image/jpeg",
                                "width": 503,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/yLgJAiVsSgRp54-MlMmcfYup.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/yLgJAiVsSgRp54-MlMmcfYup.jpeg",
                            "asset_metadata": {
                                "size": 5523,
                                "type": "image/jpeg",
                                "width": 157,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/yLgJAiVsSgRp54-MlMmcfYup.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/yLgJAiVsSgRp54-MlMmcfYup.jpeg",
                            "asset_metadata": {
                                "size": 5304,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/yLgJAiVsSgRp54-MlMmcfYup.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631627/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631627/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631627/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631627/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/x5qNT_5z83L_QU3e0eGt__O1.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/x5qNT_5z83L_QU3e0eGt__O1.jpeg",
                            "asset_metadata": {
                                "size": 247209,
                                "type": "image/jpeg",
                                "width": 1500,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/x5qNT_5z83L_QU3e0eGt__O1.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/x5qNT_5z83L_QU3e0eGt__O1.jpeg",
                            "asset_metadata": {
                                "size": 34411,
                                "type": "image/jpeg",
                                "width": 432,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/x5qNT_5z83L_QU3e0eGt__O1.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/x5qNT_5z83L_QU3e0eGt__O1.jpeg",
                            "asset_metadata": {
                                "size": 5090,
                                "type": "image/jpeg",
                                "width": 135,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/x5qNT_5z83L_QU3e0eGt__O1.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/x5qNT_5z83L_QU3e0eGt__O1.jpeg",
                            "asset_metadata": {
                                "size": 4654,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/x5qNT_5z83L_QU3e0eGt__O1.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631628/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631628/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631628/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631628/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg",
                            "asset_metadata": {
                                "size": 349988,
                                "type": "image/jpeg",
                                "width": 1627,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg",
                            "asset_metadata": {
                                "size": 36340,
                                "type": "image/jpeg",
                                "width": 468,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg",
                            "asset_metadata": {
                                "size": 4298,
                                "type": "image/jpeg",
                                "width": 146,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg",
                            "asset_metadata": {
                                "size": 4005,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/8WjdWFJZVV7RFvF4YSFTlB7P.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631629/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631629/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631629/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631629/large"
                        }
                    }]
                },
                "AuctionLot.332716": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "332716",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "\u003cp>Like new Model A2377 Apple Space Gray 128 GB iPad Pro 11\" Table with Wi-Fi. This item is a store display unit. &nbsp;It appears to be in very nice condition and function as it is intended to. &nbsp;Inspect it in person. &nbsp;\u003c/p>",
                    "lot_number": "67",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Like new Apple 128 GB iPad Pro, 3rd Generation 11\" Tablet with Wi-Fi.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:15:12.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 230,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": false,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "518764", # This is not our user and signifies that the user is outbid on this item
                        "user_display": "l****5",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2791",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2791",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 200
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 200
                    },
                    "bid_count": 27,
                    "bid_increment_amount": 10,
                    "required_bid": 240,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15632759,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                        "file_name": "P6ve51tYbtmyCxcYaZ4Cp6jB.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                        "asset_metadata": {
                            "size": 1104271,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/5/4aLqe0t9igyunKiWbKb_pmBg.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15632759/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15632759/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15632759/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632759/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 5,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "155973"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                            "asset_metadata": {
                                "size": 340070,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1327,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/4aLqe0t9igyunKiWbKb_pmBg.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                            "asset_metadata": {
                                "size": 45401,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 510,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/4aLqe0t9igyunKiWbKb_pmBg.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                            "asset_metadata": {
                                "size": 6166,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 159,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/4aLqe0t9igyunKiWbKb_pmBg.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/4aLqe0t9igyunKiWbKb_pmBg.jpeg",
                            "asset_metadata": {
                                "size": 4122,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/4aLqe0t9igyunKiWbKb_pmBg.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632759/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632759/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632759/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632759/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg",
                            "asset_metadata": {
                                "size": 887003,
                                "type": "image/jpeg",
                                "width": 1780,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg",
                            "asset_metadata": {
                                "size": 33228,
                                "type": "image/jpeg",
                                "width": 513,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg",
                            "asset_metadata": {
                                "size": 4331,
                                "type": "image/jpeg",
                                "width": 161,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg",
                            "asset_metadata": {
                                "size": 3715,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/Gm2pFDNBVyTiJB5MdRlv9Bqw.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632760/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632760/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632760/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632760/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg",
                            "asset_metadata": {
                                "size": 301362,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1093,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg",
                            "asset_metadata": {
                                "size": 57164,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 420,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg",
                            "asset_metadata": {
                                "size": 4472,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 131,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg",
                            "asset_metadata": {
                                "size": 1887,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/b3QAFn6T9dZb7sgKkAhNC5Ti.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632761/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632761/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632761/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632761/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/DfA7XCu34q6IdL4EsRwfwQnu.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/DfA7XCu34q6IdL4EsRwfwQnu.jpeg",
                            "asset_metadata": {
                                "size": 77165,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 272,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/DfA7XCu34q6IdL4EsRwfwQnu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/DfA7XCu34q6IdL4EsRwfwQnu.jpeg",
                            "asset_metadata": {
                                "size": 10464,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 104,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/DfA7XCu34q6IdL4EsRwfwQnu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/DfA7XCu34q6IdL4EsRwfwQnu.jpeg",
                            "asset_metadata": {
                                "size": 1171,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 32,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/DfA7XCu34q6IdL4EsRwfwQnu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/DfA7XCu34q6IdL4EsRwfwQnu.jpeg",
                            "asset_metadata": {
                                "size": 1202,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/DfA7XCu34q6IdL4EsRwfwQnu.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632762/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632762/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632762/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632762/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/wgEApk_9MCqYsuLmfvV_sLxv.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/wgEApk_9MCqYsuLmfvV_sLxv.jpeg",
                            "asset_metadata": {
                                "size": 244743,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1034,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/wgEApk_9MCqYsuLmfvV_sLxv.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/wgEApk_9MCqYsuLmfvV_sLxv.jpeg",
                            "asset_metadata": {
                                "size": 50619,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 397,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/wgEApk_9MCqYsuLmfvV_sLxv.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/wgEApk_9MCqYsuLmfvV_sLxv.jpeg",
                            "asset_metadata": {
                                "size": 4295,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 124,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/wgEApk_9MCqYsuLmfvV_sLxv.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/wgEApk_9MCqYsuLmfvV_sLxv.jpeg",
                            "asset_metadata": {
                                "size": 2589,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/wgEApk_9MCqYsuLmfvV_sLxv.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632763/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632763/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632763/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632763/large"
                        }
                    }]
                },
                "AuctionLot.332714": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "332714",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "\u003cul class=\"KsbFXc U6u95\" data-sfc-root=\"c\" data-sfc-cb=\"\">\n\u003cli class=\"dF3vjf\" data-sfc-root=\"c\" data-sfc-cb=\"\" data-hveid=\"CAEIABAL\">\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">\u003cstrong class=\"Yjhzub\" data-sfc-root=\"c\" data-sfc-cb=\"\">Dimensions:\u003c/strong>&nbsp;45mm x 38mm x 10.7mm.\u003c/span>\u003c/li>\n\u003cli class=\"dF3vjf\" data-sfc-root=\"c\" data-sfc-cb=\"\" data-hveid=\"CAEIABAM\">\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">\u003cstrong class=\"Yjhzub\" data-sfc-root=\"c\" data-sfc-cb=\"\">Case Material:\u003c/strong>&nbsp;Aluminum with Ion-X glass and ceramic/sapphire crystal back.\u003c/span>\u003c/li>\n\u003cli class=\"dF3vjf\" data-sfc-root=\"c\" data-sfc-cb=\"\" data-hveid=\"CAEIABAN\">\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">\u003cstrong class=\"Yjhzub\" data-sfc-root=\"c\" data-sfc-cb=\"\">Connectivity:\u003c/strong>&nbsp;GPS/GNSS, Wi-Fi 802.11b/g/n 2.4GHz/5GHz, Bluetooth 5.0.\u003c/span>\u003c/li>\n\u003cli class=\"dF3vjf\" data-sfc-root=\"c\" data-sfc-cb=\"\" data-hveid=\"CAEIABAN\">\u003cstrong>\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">Battery Life:&nbsp;\u003c/span>\u003c/strong>\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\"> Up to 18 hours.\u003c/span>\u003c/li>\n\u003cli class=\"dF3vjf\" data-sfc-root=\"c\" data-sfc-cb=\"\" data-hveid=\"CAEIABAN\">\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">\u003cstrong>Display:&nbsp;\u003c/strong> Larger display area with 368x448 pixel resolution.&nbsp;\u003c/span>\u003c/li>\n\u003cli class=\"dF3vjf\" data-sfc-root=\"c\" data-sfc-cb=\"\" data-hveid=\"CAEIABAN\">\u003cstrong>\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">Health Sensors:&nbsp; \u003c/span>\u003c/strong>\u003cspan class=\"T286Pc\" data-sfc-cp=\"\" data-sfc-root=\"c\" data-sfc-cb=\"\">Blood Oxygen sensor, Electrical Heart Sensor (ECG), Third Generation optical heart sensor.&nbsp;\u003c/span>\u003c/li>\n\u003c/ul>\n\u003cdiv id=\"sdh_j2S_aYydJbnpkPIPt_mJ8Q0_1\">\u003cstrong>&nbsp;&nbsp;\u003c/strong>\u003c/div>",
                    "lot_number": "68",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Brand New Apple Watch - Series 7 45mm Starlight Aluminum Case & 45mm Starlight Sport Band, Model A2474. This box appears to be factory sealed.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:15:24.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 110,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678",
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2791",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2791",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": "",
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 110
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 110
                    },
                    "bid_count": 15,
                    "bid_increment_amount": 5,
                    "required_bid": 115,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15632748,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                        "file_name": "El-ClJjGZU-qcAKKVgmbRzLn.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                        "asset_metadata": {
                            "size": 531854,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/3/b6TnIMMBa6iuZresAW8hN02_.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15632748/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15632748/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15632748/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632748/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 4,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "160780"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                            "asset_metadata": {
                                "size": 129994,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 631,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/b6TnIMMBa6iuZresAW8hN02_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                            "asset_metadata": {
                                "size": 10970,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 242,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/b6TnIMMBa6iuZresAW8hN02_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                            "asset_metadata": {
                                "size": 1724,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 76,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/b6TnIMMBa6iuZresAW8hN02_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/b6TnIMMBa6iuZresAW8hN02_.jpeg",
                            "asset_metadata": {
                                "size": 2120,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/b6TnIMMBa6iuZresAW8hN02_.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632748/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632748/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632748/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632748/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/5vQTUD-NUEMVjyKloMTghWLN.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/5vQTUD-NUEMVjyKloMTghWLN.jpeg",
                            "asset_metadata": {
                                "size": 364929,
                                "type": "image/jpeg",
                                "width": 1838,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/5vQTUD-NUEMVjyKloMTghWLN.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/5vQTUD-NUEMVjyKloMTghWLN.jpeg",
                            "asset_metadata": {
                                "size": 28852,
                                "type": "image/jpeg",
                                "width": 529,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/5vQTUD-NUEMVjyKloMTghWLN.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/5vQTUD-NUEMVjyKloMTghWLN.jpeg",
                            "asset_metadata": {
                                "size": 3718,
                                "type": "image/jpeg",
                                "width": 166,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/5vQTUD-NUEMVjyKloMTghWLN.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/5vQTUD-NUEMVjyKloMTghWLN.jpeg",
                            "asset_metadata": {
                                "size": 3425,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/5vQTUD-NUEMVjyKloMTghWLN.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632749/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632749/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632749/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632749/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/I-JYoU3RcbmuHga74ZyoGEtc.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/I-JYoU3RcbmuHga74ZyoGEtc.jpeg",
                            "asset_metadata": {
                                "size": 104828,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 350,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/I-JYoU3RcbmuHga74ZyoGEtc.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/I-JYoU3RcbmuHga74ZyoGEtc.jpeg",
                            "asset_metadata": {
                                "size": 17968,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 134,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/I-JYoU3RcbmuHga74ZyoGEtc.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/I-JYoU3RcbmuHga74ZyoGEtc.jpeg",
                            "asset_metadata": {
                                "size": 2006,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 42,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/I-JYoU3RcbmuHga74ZyoGEtc.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/I-JYoU3RcbmuHga74ZyoGEtc.jpeg",
                            "asset_metadata": {
                                "size": 1796,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/I-JYoU3RcbmuHga74ZyoGEtc.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632750/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632750/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632750/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632750/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/3/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/large/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg",
                            "asset_metadata": {
                                "size": 136022,
                                "type": "image/jpeg",
                                "width": 685,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/3/large/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/medium/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg",
                            "asset_metadata": {
                                "size": 11232,
                                "type": "image/jpeg",
                                "width": 197,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/3/medium/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/small/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg",
                            "asset_metadata": {
                                "size": 1384,
                                "type": "image/jpeg",
                                "width": 62,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/3/small/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/3/thumb/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg",
                            "asset_metadata": {
                                "size": 2043,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/3/thumb/d3rFT2ciOCmHgaCkxzkm5JYu.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15632751/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15632751/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15632751/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15632751/large"
                        }
                    }]
                },
                "AuctionLot.329672": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "329672",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "",
                    "lot_number": "107",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Brand New, High-End, Sonos Beam (Gen 2) This latest generation of Sonos Beam has Dolby Atmos - Dolby Atmos maps sounds for a 3D effect. Experience planes like they are flying overhead, hear footsteps moving across the room & feel the musical score all around you. Stream music, radio & more when the TV is off.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:21:36.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 250,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678",
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2791",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2791",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 250
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 250
                    },
                    "bid_count": 49,
                    "bid_increment_amount": 10,
                    "required_bid": 260,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15617186,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                        "file_name": "YbCWWsp8yGj55kPsLdfzCyM-.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                        "asset_metadata": {
                            "size": 689717,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/2/raeqiY9zlwuDprt3nCUV-y9R.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15617186/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15617186/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15617186/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15617186/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 4,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "150112"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                            "asset_metadata": {
                                "size": 166796,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 737,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/raeqiY9zlwuDprt3nCUV-y9R.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                            "asset_metadata": {
                                "size": 16394,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 283,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/raeqiY9zlwuDprt3nCUV-y9R.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                            "asset_metadata": {
                                "size": 2520,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 88,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/raeqiY9zlwuDprt3nCUV-y9R.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/raeqiY9zlwuDprt3nCUV-y9R.jpeg",
                            "asset_metadata": {
                                "size": 2209,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/raeqiY9zlwuDprt3nCUV-y9R.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15617186/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15617186/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15617186/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15617186/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/ODvZCY1NbXLc5RYWKloERcwM.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/ODvZCY1NbXLc5RYWKloERcwM.jpeg",
                            "asset_metadata": {
                                "size": 37723,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 920,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/ODvZCY1NbXLc5RYWKloERcwM.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/ODvZCY1NbXLc5RYWKloERcwM.jpeg",
                            "asset_metadata": {
                                "size": 9405,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 353,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/ODvZCY1NbXLc5RYWKloERcwM.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/ODvZCY1NbXLc5RYWKloERcwM.jpeg",
                            "asset_metadata": {
                                "size": 1693,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 110,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/ODvZCY1NbXLc5RYWKloERcwM.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/ODvZCY1NbXLc5RYWKloERcwM.jpeg",
                            "asset_metadata": {
                                "size": 1533,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/ODvZCY1NbXLc5RYWKloERcwM.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15617187/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15617187/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15617187/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15617187/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/HYID430VXrhDTG8Tr5xQXeWa.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/HYID430VXrhDTG8Tr5xQXeWa.jpeg",
                            "asset_metadata": {
                                "size": 142669,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 765,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/HYID430VXrhDTG8Tr5xQXeWa.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/HYID430VXrhDTG8Tr5xQXeWa.jpeg",
                            "asset_metadata": {
                                "size": 18063,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 294,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/HYID430VXrhDTG8Tr5xQXeWa.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/HYID430VXrhDTG8Tr5xQXeWa.jpeg",
                            "asset_metadata": {
                                "size": 2468,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 92,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/HYID430VXrhDTG8Tr5xQXeWa.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/HYID430VXrhDTG8Tr5xQXeWa.jpeg",
                            "asset_metadata": {
                                "size": 2338,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/HYID430VXrhDTG8Tr5xQXeWa.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15617188/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15617188/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15617188/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15617188/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/_5vC7dJgGS-il0JW4rsnsUV5.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/_5vC7dJgGS-il0JW4rsnsUV5.jpeg",
                            "asset_metadata": {
                                "size": 169354,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 563,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/_5vC7dJgGS-il0JW4rsnsUV5.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/_5vC7dJgGS-il0JW4rsnsUV5.jpeg",
                            "asset_metadata": {
                                "size": 22587,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 216,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/_5vC7dJgGS-il0JW4rsnsUV5.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/_5vC7dJgGS-il0JW4rsnsUV5.jpeg",
                            "asset_metadata": {
                                "size": 2318,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 67,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/_5vC7dJgGS-il0JW4rsnsUV5.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/_5vC7dJgGS-il0JW4rsnsUV5.jpeg",
                            "asset_metadata": {
                                "size": 1514,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/_5vC7dJgGS-il0JW4rsnsUV5.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15617189/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15617189/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15617189/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15617189/large"
                        }
                    }]
                },
                "AuctionLot.330181": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "330181",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "\u003cp>This item is a store display unit. &nbsp;It appears to be in very nice condition and function as it is intended to. &nbsp;Inspect it in person.&nbsp;\u003c/p>",
                    "lot_number": "115",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Like New Samsung Q65C Soundbar. Q-Symphony & Dolby ATMOS Audio, 5.1 Channel Sound Bar W/ Wireless Subwoofer.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:23:12.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 140,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678",
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2791",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2791",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 140
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 140
                    },
                    "bid_count": 27,
                    "bid_increment_amount": 5,
                    "required_bid": 145,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15619822,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                        "file_name": "FxowsqP0tBDAuwXIM_oRfyfq.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                        "asset_metadata": {
                            "size": 659531,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/5/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15619822/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15619822/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15619822/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619822/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 4,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "159498"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                            "asset_metadata": {
                                "size": 199300,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 897,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                            "asset_metadata": {
                                "size": 33780,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 344,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                            "asset_metadata": {
                                "size": 4561,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 107,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg",
                            "asset_metadata": {
                                "size": 3251,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/IJpxF7hq6uTPgl7Hr7YWK8BX.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619822/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619822/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619822/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619822/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/e3uFCC1INQdMpf1BKNCsMeKS.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/e3uFCC1INQdMpf1BKNCsMeKS.jpeg",
                            "asset_metadata": {
                                "size": 289817,
                                "type": "image/jpeg",
                                "width": 1476,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/e3uFCC1INQdMpf1BKNCsMeKS.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/e3uFCC1INQdMpf1BKNCsMeKS.jpeg",
                            "asset_metadata": {
                                "size": 30001,
                                "type": "image/jpeg",
                                "width": 425,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/e3uFCC1INQdMpf1BKNCsMeKS.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/e3uFCC1INQdMpf1BKNCsMeKS.jpeg",
                            "asset_metadata": {
                                "size": 4255,
                                "type": "image/jpeg",
                                "width": 132,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/e3uFCC1INQdMpf1BKNCsMeKS.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/e3uFCC1INQdMpf1BKNCsMeKS.jpeg",
                            "asset_metadata": {
                                "size": 4032,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/e3uFCC1INQdMpf1BKNCsMeKS.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619823/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619823/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619823/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619823/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/ePc1TX79rOHW0lBt5gZIXVB_.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/ePc1TX79rOHW0lBt5gZIXVB_.jpeg",
                            "asset_metadata": {
                                "size": 233014,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 877,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/ePc1TX79rOHW0lBt5gZIXVB_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/ePc1TX79rOHW0lBt5gZIXVB_.jpeg",
                            "asset_metadata": {
                                "size": 34317,
                                "type": "image/jpeg",
                                "width": 768,
                                "height": 337,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/ePc1TX79rOHW0lBt5gZIXVB_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/ePc1TX79rOHW0lBt5gZIXVB_.jpeg",
                            "asset_metadata": {
                                "size": 4425,
                                "type": "image/jpeg",
                                "width": 240,
                                "height": 105,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/ePc1TX79rOHW0lBt5gZIXVB_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/ePc1TX79rOHW0lBt5gZIXVB_.jpeg",
                            "asset_metadata": {
                                "size": 3215,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/ePc1TX79rOHW0lBt5gZIXVB_.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619824/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619824/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619824/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619824/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg",
                            "asset_metadata": {
                                "size": 335099,
                                "type": "image/jpeg",
                                "width": 1707,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg",
                            "asset_metadata": {
                                "size": 40881,
                                "type": "image/jpeg",
                                "width": 492,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg",
                            "asset_metadata": {
                                "size": 4922,
                                "type": "image/jpeg",
                                "width": 153,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg",
                            "asset_metadata": {
                                "size": 4323,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/g_DS7OHYjMgzBBXn4rBMRbJz.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619825/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619825/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619825/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619825/large"
                        }
                    }]
                },
                "AuctionLot.332415": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "332415",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "",
                    "lot_number": "228",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Like New Nex Playground Camera-Based AI-Powered Video Game Console. This is designed to connect to a TV & transform living rooms into active, motion-controlled virtual play areas. Requires no handheld controllers, or VR headsets - allowing up to 4 players to use their whole bodies for games like sports, dance & interactive adventures. This item is a store display unit.  It appears to be in good condition, but we cannot test it out. Inspect it in person.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T01:35:00.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 90,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678",
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2791",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2791",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 100
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 90
                    },
                    "bid_count": 28,
                    "bid_increment_amount": 5,
                    "required_bid": 95,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15631570,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                        "file_name": "XojveMG8Yijhm-el1DlDmbzo.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                        "asset_metadata": {
                            "size": 914374,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/2/nH6jZZVn0N2IYnOARqu792sP.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15631570/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15631570/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15631570/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631570/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 4,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "156398"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                            "asset_metadata": {
                                "size": 513793,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1747,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/nH6jZZVn0N2IYnOARqu792sP.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                            "asset_metadata": {
                                "size": 50654,
                                "type": "image/jpeg",
                                "width": 659,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/nH6jZZVn0N2IYnOARqu792sP.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                            "asset_metadata": {
                                "size": 5938,
                                "type": "image/jpeg",
                                "width": 206,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/nH6jZZVn0N2IYnOARqu792sP.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/nH6jZZVn0N2IYnOARqu792sP.jpeg",
                            "asset_metadata": {
                                "size": 4639,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/nH6jZZVn0N2IYnOARqu792sP.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631570/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631570/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631570/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631570/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg",
                            "asset_metadata": {
                                "size": 462915,
                                "type": "image/jpeg",
                                "width": 1503,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg",
                            "asset_metadata": {
                                "size": 25118,
                                "type": "image/jpeg",
                                "width": 433,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg",
                            "asset_metadata": {
                                "size": 3176,
                                "type": "image/jpeg",
                                "width": 135,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg",
                            "asset_metadata": {
                                "size": 3225,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/MV5v7yIYLOOEdfEbWIWuyFRH.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631571/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631571/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631571/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631571/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/WMpHY8r9SND0Tt2bNZqgKct_.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/WMpHY8r9SND0Tt2bNZqgKct_.jpeg",
                            "asset_metadata": {
                                "size": 329030,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1507,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/WMpHY8r9SND0Tt2bNZqgKct_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/WMpHY8r9SND0Tt2bNZqgKct_.jpeg",
                            "asset_metadata": {
                                "size": 44178,
                                "type": "image/jpeg",
                                "width": 765,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/WMpHY8r9SND0Tt2bNZqgKct_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/WMpHY8r9SND0Tt2bNZqgKct_.jpeg",
                            "asset_metadata": {
                                "size": 4607,
                                "type": "image/jpeg",
                                "width": 239,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/WMpHY8r9SND0Tt2bNZqgKct_.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/WMpHY8r9SND0Tt2bNZqgKct_.jpeg",
                            "asset_metadata": {
                                "size": 3220,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/WMpHY8r9SND0Tt2bNZqgKct_.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631572/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631572/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631572/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631572/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/2/siAniihM65mzXbWUidtA_Um1.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/large/siAniihM65mzXbWUidtA_Um1.jpeg",
                            "asset_metadata": {
                                "size": 197522,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1676,
                                "extension": ".jpeg",
                                "destination": "2026/2/large/siAniihM65mzXbWUidtA_Um1.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/medium/siAniihM65mzXbWUidtA_Um1.jpeg",
                            "asset_metadata": {
                                "size": 25440,
                                "type": "image/jpeg",
                                "width": 687,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/2/medium/siAniihM65mzXbWUidtA_Um1.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/small/siAniihM65mzXbWUidtA_Um1.jpeg",
                            "asset_metadata": {
                                "size": 2937,
                                "type": "image/jpeg",
                                "width": 214,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/2/small/siAniihM65mzXbWUidtA_Um1.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/2/thumb/siAniihM65mzXbWUidtA_Um1.jpeg",
                            "asset_metadata": {
                                "size": 2469,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/2/thumb/siAniihM65mzXbWUidtA_Um1.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15631573/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15631573/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15631573/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15631573/large"
                        }
                    }]
                },
                "AuctionLot.330205": {
                    "__typename": "AuctionLot",
                    "auction_lot_id": "330205",
                    "auction_id": "29255",
                    "tax_type": null,
                    "quantity": 1,
                    "auction_lot_status": 100,
                    "auction_type": "online",
                    "description": "",
                    "lot_number": "601",
                    "is_bidding_disabled": false,
                    "is_marketing_lot": null,
                    "hide_winning_info": null,
                    "hide_winning_user": null,
                    "no_sale_status": "",
                    "title": "Brand New Ninja CREAMi Deluxe 11-in-1 Ice Cream Maker. Create frozen desserts, sorbet, milkshakes, yogurt & more. Includes 2 dishwasher safe XL 24 oz. tubs w/ storage lids.",
                    "lot_ref": null,
                    "lot_location": null,
                    "dynamic_fields": [],
                    "start_time": "2026-05-03T01:10:00.000Z",
                    "end_time": "2026-05-18T02:21:24.000Z",
                    "original_end_time": null,
                    "unit_quantity": null,
                    "winning_bid_amount": 95,
                    "is_no_sale": false,
                    "am_bidding": true,
                    "am_winning": true,
                    "winning_bidder": {
                        "__typename": "ObscuredUser",
                        "user_id": "519678",
                        "user_display": "k1989f@gmail.com",
                        "country_code": "US"
                    },
                    "basic_consignor": null,
                    "category_id": "2994",
                    "category": {
                        "__typename": "CategoryPath",
                        "category_id": "2994",
                        "seller_info_on_front": null
                    },
                    "reserve_met": null,
                    "pending_confirmation": null,
                    "has_reserve": null,
                    "group_key": null,
                    "my_max_proxy": {
                        "__typename": "SimpleProxyBid",
                        "amount": 100
                    },
                    "my_max_bid": {
                        "__typename": "SimpleBid",
                        "amount": 95
                    },
                    "bid_count": 44,
                    "bid_increment_amount": 5,
                    "required_bid": 100,
                    "starting_bid": 10,
                    "dutch_minimum": null,
                    "dutch_drop_amount": null,
                    "primary_image": {
                        "attachment_id": 15619923,
                        "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                        "file_name": "e3OH1AofDvi8ac26PQh4QtXe.jpeg",
                        "large": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                        "medium": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                        "small": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                        "thumb": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                        "asset_metadata": {
                            "size": 1235911,
                            "type": "image/jpeg",
                            "extension": ".jpeg",
                            "destination": "2026/5/pBe0GDbGd49T7A69vz8VPiOs.jpeg"
                        },
                        "asset_url_image_variants": {
                            "large": "https://www.whitleyauction.com/asset/image/15619923/large",
                            "medium": "https://www.whitleyauction.com/asset/image/15619923/medium",
                            "small": "https://www.whitleyauction.com/asset/image/15619923/small",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619923/thumb"
                        }
                    },
                    "is_watched": true,
                    "auction_paused_at": null,
                    "simulcast_status": 0,
                    "is_past_end_time": false,
                    "watch_count": 0,
                    "image_tag": "",
                    "image_tag_color": null,
                    "image_tag_text_color": null,
                    "link_url": null,
                    "link_text": null,
                    "is_passed": false,
                    "price": null,
                    "no_sale_text": null,
                    "no_sale_hide_price": null,
                    "bidding_threshold": null,
                    "add_on_total": null,
                    "allow_offers": false,
                    "allow_donations": null,
                    "buy_it_now_active": false,
                    "buy_it_now_price": null,
                    "buy_it_now_sold": null,
                    "auction_ring": null,
                    "has_video": false,
                    "image_count": 6,
                    "inventory": {
                        "__typename": "SimpleInventory",
                        "inventory_ref": "159575"
                    },
                    "bidding_form_id": null,
                    "bid_with_premium": null,
                    "require_lot_terms": null,
                    "my_lot_terms_approval_status": false,
                    "premium": null,
                    "online_premium": null,
                    "ai_applied_at": null,
                    "public_domain": "www.whitleyauction.com",
                    "my_lot_note_count": 0,
                    "auction": {
                        "__typename": "SimpleAuction",
                        "auction_id": "29255",
                        "auction_status": 200,
                        "title": "Sunday Night Madness Massive Online Auction",
                        "start_time": "2026-05-03T01:10:00Z",
                        "end_time": "2026-05-18T01:12:00Z",
                        "prebid_start_time": null,
                        "prebid_end_time": null,
                        "paused_at": null,
                        "is_prebidding_allowed": false,
                        "type": "online",
                        "is_approval_required": false,
                        "my_registration_status": 100,
                        "my_terms_approval_status": true,
                        "my_pickup_location_status": null,
                        "my_payment_authorization_status": true,
                        "my_shipping_preference_status": true,
                        "payment_authorization_amount": 1,
                        "payment_auth_is_reg_fee": null,
                        "require_terms_approval": true,
                        "require_pickup_location": false,
                        "hide_winning_info": false,
                        "hide_winning_user": false,
                        "hide_bid_history": false,
                        "disable_cc_to_bid": null,
                        "only_hide_info_during_prebid": false,
                        "per_unit_bidding": "never",
                        "unit_type_singular": null,
                        "unit_type_plural": null,
                        "bid_type": null,
                        "dutch_drop_interval": null,
                        "hide_start_time": false,
                        "hide_end_time": null,
                        "bidding_threshold": null,
                        "my_bidding_threshold_approval_status": 0,
                        "show_high_offer": null,
                        "bidding_form_id": null,
                        "public_domain": "www.whitleyauction.com",
                        "my_platform_fee_status": null,
                        "disable_cart": null,
                        "buy_it_now_end_time": null
                    },
                    "images": [{
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                            "asset_metadata": {
                                "size": 536520,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1903,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/pBe0GDbGd49T7A69vz8VPiOs.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                            "asset_metadata": {
                                "size": 62143,
                                "type": "image/jpeg",
                                "width": 605,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/pBe0GDbGd49T7A69vz8VPiOs.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                            "asset_metadata": {
                                "size": 8519,
                                "type": "image/jpeg",
                                "width": 189,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/pBe0GDbGd49T7A69vz8VPiOs.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/pBe0GDbGd49T7A69vz8VPiOs.jpeg",
                            "asset_metadata": {
                                "size": 7330,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/pBe0GDbGd49T7A69vz8VPiOs.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619923/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619923/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619923/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619923/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg",
                            "asset_metadata": {
                                "size": 444419,
                                "type": "image/jpeg",
                                "width": 1441,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg",
                            "asset_metadata": {
                                "size": 42703,
                                "type": "image/jpeg",
                                "width": 415,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg",
                            "asset_metadata": {
                                "size": 5922,
                                "type": "image/jpeg",
                                "width": 130,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg",
                            "asset_metadata": {
                                "size": 5763,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/uk6_LWHPPwkbbLWrvZfR2ZWG.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619924/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619924/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619924/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619924/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg",
                            "asset_metadata": {
                                "size": 552024,
                                "type": "image/jpeg",
                                "width": 2000,
                                "height": 1993,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg",
                            "asset_metadata": {
                                "size": 61786,
                                "type": "image/jpeg",
                                "width": 578,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg",
                            "asset_metadata": {
                                "size": 8456,
                                "type": "image/jpeg",
                                "width": 181,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg",
                            "asset_metadata": {
                                "size": 7520,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/lPi3W5gL3V-NZhn1GPeIBmVk.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619925/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619925/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619925/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619925/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg",
                            "asset_metadata": {
                                "size": 405140,
                                "type": "image/jpeg",
                                "width": 1403,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg",
                            "asset_metadata": {
                                "size": 45055,
                                "type": "image/jpeg",
                                "width": 404,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg",
                            "asset_metadata": {
                                "size": 5996,
                                "type": "image/jpeg",
                                "width": 126,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg",
                            "asset_metadata": {
                                "size": 5835,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/m7cLzTVxCqQqcnbXWd2E9P3o.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619926/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619926/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619926/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619926/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg",
                            "asset_metadata": {
                                "size": 349709,
                                "type": "image/jpeg",
                                "width": 1926,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg",
                            "asset_metadata": {
                                "size": 40806,
                                "type": "image/jpeg",
                                "width": 555,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg",
                            "asset_metadata": {
                                "size": 5819,
                                "type": "image/jpeg",
                                "width": 173,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg",
                            "asset_metadata": {
                                "size": 5466,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/Wq8yHW1cGLSRvhC8qBOD-pea.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619927/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619927/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619927/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619927/large"
                        }
                    }, {
                        "__typename": "Attachment",
                        "asset_metadata": {
                            "__typename": "AttachmentMetadata",
                            "type": "image/jpeg",
                            "alt": null
                        },
                        "storage_details": {
                            "Key": "rmeb/2026/5/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg",
                            "Bucket": "auctioneersoftware"
                        },
                        "cached_assets": [{
                            "__typename": "CachedAsset",
                            "variant": "large",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/large/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg",
                            "asset_metadata": {
                                "size": 295259,
                                "type": "image/jpeg",
                                "width": 1090,
                                "height": 2000,
                                "extension": ".jpeg",
                                "destination": "2026/5/large/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "medium",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/medium/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg",
                            "asset_metadata": {
                                "size": 32427,
                                "type": "image/jpeg",
                                "width": 314,
                                "height": 576,
                                "extension": ".jpeg",
                                "destination": "2026/5/medium/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "small",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/small/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg",
                            "asset_metadata": {
                                "size": 4802,
                                "type": "image/jpeg",
                                "width": 98,
                                "height": 180,
                                "extension": ".jpeg",
                                "destination": "2026/5/small/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg"
                            }
                        }, {
                            "__typename": "CachedAsset",
                            "variant": "thumb",
                            "url": "https://d3j17a2r8lnfte.cloudfront.net/rmeb/2026/5/thumb/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg",
                            "asset_metadata": {
                                "size": 4853,
                                "type": "image/jpeg",
                                "width": 175,
                                "height": 175,
                                "extension": ".jpeg",
                                "destination": "2026/5/thumb/JYXH4t3Z7Lvv4p0CIr87kIdu.jpeg"
                            }
                        }],
                        "asset_url_image_variants": {
                            "__typename": "AssetUrlImageVariants",
                            "thumb": "https://www.whitleyauction.com/asset/image/15619928/thumb",
                            "small": "https://www.whitleyauction.com/asset/image/15619928/small",
                            "medium": "https://www.whitleyauction.com/asset/image/15619928/medium",
                            "large": "https://www.whitleyauction.com/asset/image/15619928/large"
                        }
                    }]
                },
                "Auction.29255": {
                    "__typename": "Auction",
                    "auction_id": "29255",
                    "my_winning_bid_total": 976.5,
                    "my_winning_max_bid_total": 995
                }
            };
        </script>
        <script id="__LOADABLE_REQUIRED_CHUNKS__" type="application/json">
            [
                8535,
                9291,
                2395,
                5740,
                9606,
                3550,
                8224
            ]</script>
        <script id="__LOADABLE_REQUIRED_CHUNKS___ext" type="application/json">
            {
                "namedChunks": [
                    "pages-account",
                    "watchlist"
                ]

