/****************************************************************************************
 * LiveZilla ChatServerEvaluationClass.js
 *
 * Copyright 2016 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function ChatServerEvaluationClass(lzm_commonTools, chosenProfile, lzm_chatTimeStamp) {

    this.lzm_commonConfig = new CommonConfigClass();
    this.lzm_commonTools = lzm_commonTools;
    this.lzm_chatTimeStamp = lzm_chatTimeStamp;
    this.commonEvaluation = {};

    this.myName = '';
    this.myId = '';
    this.myGroup = '';
    this.myUserId = '';
    this.myEmail = '';
    this.chosen_profile = {};
    this.serverUrl = chosenProfile.server_url;
    this.serverProtocol = chosenProfile.server_protocol;
    this.permissions = [];
    this.crc3 = null;
    this.oo = null;
    this.maxOperatorNumber = null;
    this.global_configuration = {};
    this.translationLanguages = [];
    this.external_forwards = [];
    this.tickets = [];
    this.ticketGlobalValues = {p: 20, q: 0, t: 0, r: 0, e: 0};
    this.ticketFetchTime = 0;
    this.ticketWatchList = [];
    this.expectTicketChanges = false;
    this.login_data = {};
    this.global_typing = [];
    this.global_errors = [];
    this.wps = [];
    this.chatMessageCounter = 0;
    this.rec_posts = [];
    this.chatArchive = {chats: [], q: '', p: 20, t: 0};
    this.archiveFetchTime = 0;
    this.expectArchiveChanges = false;
    this.cannedResources = new LzmResources();
    this.resources = [];
    this.resourceIdList = [];
    this.resourceLastEdited = 0;
    this.emails = [];
    this.emailCount = 0;
    this.reportFetchTime = 0;
    this.expectReportChanges = false;
    this.otrs = null;
    this.feedbacksTotal = 0;
    this.feedbacksPage = 20;
    this.feedbacksMaxCreated = 0;
    this.translationStrings = {key: '', strings: {}};
    this.pollFrequency = 0;
    this.timeoutClients = 0;
    this.siteName = '';
    this.defaultLanguage = '';
    this.isRootServer = true;
    this.hostName = '';
    this.userLanguage = '';
    this.inputList = new LzmCustomInputs();
    this.filters = new LzmFilters();
    this.eventList = [];
    this.feedbacksList = [];
    this.operators = new LzmOperators();
    this.groups = new LzmGroups();
    this.oldGroupIdList = [];
    this.userChats = new LzmUserChats();
    this.reports = new LzmReports();
    this.ChatManager = new ChatManager();

    this.m_BacklinkHTML = '';
    this.m_BacklinkTitle = '';
    this.m_BacklinkUrl = '';
    this.m_BacklinkIndex = 0;
    this.m_ServerConfigBlocked = false;

    this.new_ext_u = false;
    this.new_ext_f = false;
    this.new_usr_p = false;
    this.new_int_d = false;
    this.new_int_u = false;
    this.new_ev = false;
    this.new_dt = false;
    this.new_de = false;
    this.new_dc = false;
    this.new_dr = false;
    this.new_qrd = false;
    this.new_ext_b = false;
    this.new_trl = false;
    this.new_startpage = {lz: false, ca: [], cr: []};
    this.eventActionShowAlert = false;
}

ChatServerEvaluationClass.TrialExpireCall = false;

ChatServerEvaluationClass.prototype.setUserLanguage = function(userLang) {
    this.userLanguage = userLang;
    this.commonEvaluation = new CommonServerEvaluationClass(userLang);
};

ChatServerEvaluationClass.prototype.resetWebApp = function() {
    this.external_forwards = [];
    ChatManager.ActiveChat = 'LIST';
    this.global_typing = [];
    this.global_errors = [];
    this.wps = [];
    this.rec_posts = [];
    this.chatArchive = {chats: [], q: '', p: 20, t: 0};
    this.operators.clearOperators();
    this.groups.clearGroups();
    this.new_ext_u =
    this.new_ext_f =
    this.new_usr_p =
    this.new_int_d =
    this.new_int_u =
    this.new_ev =
    this.new_dt =
    this.new_de =
    this.new_dc =
    this.new_qrd =
    this.new_ext_b = true;
    lzm_chatDisplay.VisitorsUI.ResetVisitorList(true);
};

ChatServerEvaluationClass.prototype.getLogin = function (xmlDoc) {
    var thisClass = this,cp=false;
    $(xmlDoc).find('login').each(function () {
        var login = $(this);
        login.children('login_return').each(function () {
            var myReturn = $(this);
            var myAttributes = myReturn[0].attributes;
            for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
                thisClass.login_data[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);

                if (thisClass.oo == null && myAttributes[attrIndex].name == 'oo')
                    thisClass.oo = lz_global_base64_url_decode(myAttributes[attrIndex].value);

                if (thisClass.token == null && myAttributes[attrIndex].name == 't')
                    thisClass.token = lz_global_base64_url_decode(myAttributes[attrIndex].value);

                if (myAttributes[attrIndex].name == 'cp' && lz_global_base64_url_decode(myAttributes[attrIndex].value)=='1')
                    cp=true;

            }
            if (typeof thisClass.login_data.perms != 'undefined' && thisClass.login_data.perms != '')
            {
                thisClass.permissions = thisClass.login_data.perms.split('');
                lzm_commonPermissions.getUserPermissions(true);
            }
        });

        thisClass.serverTime = lz_global_base64_url_decode(login.children('login_return')[0].attributes['time'].value);
        thisClass.myName = thisClass.login_data.name;
        thisClass.myId = thisClass.login_data.sess;

        if (typeof thisClass.login_data != 'undefined' && typeof thisClass.login_data.timediff != 'undefined') {
            thisClass.lzm_chatTimeStamp.setTimeDifference(thisClass.login_data.timediff);
        }

        if(cp)
        {
            changePassword(null,true);
        }

    });
};

ChatServerEvaluationClass.prototype.getValidationError = function (xmlDoc) {
    var error_value = '-1';
    $(xmlDoc).find('validation_error').each(function () {
        if (error_value == -1) {
            error_value = lz_global_base64_url_decode($(this).attr('value'));
        }
    });
    return error_value;
};

ChatServerEvaluationClass.prototype.getServerVersion = function(xmlDoc) {
    var serverVersion = '';
    $(xmlDoc).find('livezilla_version').each(function() {
        serverVersion = lz_global_base64_url_decode($(this).text());
    });
    return serverVersion;
};

ChatServerEvaluationClass.prototype.getGlobalConfiguration = function (xmlDoc) {
    var thisClass = this;
    var myHash = '';
    $(xmlDoc).find('gl_c').each(function () {

        DataEngine.m_ServerConfigBlocked = false;
        $('#main-menu-panel-tools-configuration').removeClass('ui-disabled');

        var gl_c = $(this);
        thisClass.global_configuration = {toplevel: [], site: {}, php_cfg_vars: {}, database: {}};
        thisClass.global_configuration.database['tsd'] = [];
        thisClass.global_configuration.database['goals'] = [];
        thisClass.global_configuration.database['fbc'] = [];
        thisClass.global_configuration.database['email'] = [];
        $(gl_c).children('conf').each(function () {
            var conf = $(this);
            var new_conf = {};
            new_conf.key = lz_global_base64_url_decode(conf.attr('key'));
            new_conf.value = lz_global_base64_url_decode(conf.attr('value'));
            new_conf.subkeys = {};
            $(conf).find('sub').each(function () {
                new_conf.subkeys[lz_global_base64_url_decode($(this).attr('key'))] = lz_global_base64_url_decode($(this).text());
            });
            thisClass.global_configuration.toplevel.push(new_conf);
        });
        $(gl_c).children('site').each(function () {
            var site = $(this);
            var index = lz_global_base64_url_decode(site.attr('index'));
            if (typeof thisClass.global_configuration.site[index] == 'undefined') {
                thisClass.global_configuration.site[index] = [];
            }
            $(site).find('conf').each(function () {
                var conf = $(this);
                var new_conf = {};
                new_conf.key = lz_global_base64_url_decode(conf.attr('key'));
                new_conf.value = lz_global_base64_url_decode(conf.attr('value'));
                new_conf.subkeys = {};
                $(conf).find('sub').each(function () {
                    new_conf.subkeys[lz_global_base64_url_decode($(this).attr('key'))] = lz_global_base64_url_decode($(this).text());
                });


                if(new_conf.key == 'gl_cpar'){
                    thisClass.m_BacklinkHTML = new_conf.value;
                    thisClass.m_BacklinkHTML = thisClass.m_BacklinkHTML.replace("<a class=\"lz_chat_main_link\" href=\"", "").replace("</a>", "");
                    var values = thisClass.m_BacklinkHTML.split("\" target=\"_blank\">");
                    if(values.length>=2){
                        thisClass.m_BacklinkTitle = values[1];
                        thisClass.m_BacklinkUrl = values[0];
                    }
                    else
                        thisClass.m_BacklinkTitle = thisClass.m_BacklinkUrl = '';
                }
                thisClass.global_configuration.site[index].push(new_conf);
            });
        });
        $(gl_c).children('php_cfg_vars').each(function () {
            thisClass.global_configuration.php_cfg_vars['post_max_size'] = lz_global_base64_url_decode($(this).attr('post_max_size'));
            thisClass.global_configuration.php_cfg_vars['upload_max_filesize'] = lz_global_base64_url_decode($(this).attr('upload_max_filesize'));
        });
        $(gl_c).children('translations').each(function() {
            var translations = $(this);
            thisClass.getTranslationLanguages(translations);
        });

        myHash = lz_global_base64_url_decode(gl_c.attr('h'));

        try {
            for (var i=0; i<thisClass.global_configuration.site[0].length; i++) {
                if (thisClass.global_configuration.site[0][i].key == 'gl_input_list') {
                    for (var key in thisClass.global_configuration.site[0][i].subkeys) {
                        if (thisClass.global_configuration.site[0][i].subkeys.hasOwnProperty(key)) {
                            var customInput = {id: key, value: thisClass.global_configuration.site[0][i].subkeys[key]};
                            thisClass.inputList.setCustomInput(customInput);
                        }
                    }
                }
            }
        }
        catch(e) {}


        thisClass.setConfigValues(thisClass.global_configuration);
        thisClass.setStartPages(thisClass.global_configuration);

        /*
        if (!thisClass.isRootServer && thisClass.maxOperatorNumber != null && thisClass.maxOperatorNumber != 0 &&
            parseInt(thisClass.oo) >= parseInt(thisClass.maxOperatorNumber)) {
            lzm_commonDialog.createAlertDialog(t('Maximum number of concurrent operators reached.'), [{id: 'ok', name: t('Ok')}]);
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
                logout(false);
            });
        }
        */
        $(xmlDoc).find('gl_tsd').each(function () {
            $(this).children('tsd').each(function () {
                var sd = {};
                sd.name = lz_global_base64_url_decode($(this).attr('i'));
                sd.type = lz_global_base64_url_decode($(this).attr('t'));
                sd.parent = lz_global_base64_url_decode($(this).attr('p'));
                sd.sid = lzm_commonTools.getTicketSubShortId(sd.name,sd.parent);
                thisClass.global_configuration.database['tsd'].push(sd);
            });
        });
        $(xmlDoc).find('gl_go').each(function () {
            $(this).children('tgt').each(function () {
                var go = {};
                go.id = lz_global_base64_url_decode($(this).attr('id'));
                go.title = lz_global_base64_url_decode($(this).attr('title'));
                go.desc = lz_global_base64_url_decode($(this).attr('desc'));
                go.conv = lz_global_base64_url_decode($(this).attr('conv'));
                thisClass.global_configuration.database['goals'].push(go);
            });
        });
        $(xmlDoc).find('gl_fbc').each(function () {
            $(this).children().each(function () {
                var sd = {};
                sd.id = lz_global_base64_url_decode($(this).attr('i'));
                sd.type = lz_global_base64_url_decode($(this).attr('t'));
                sd.title = lz_global_base64_url_decode($(this).text());
                sd.name = lz_global_base64_url_decode($(this).attr('n'));
                thisClass.global_configuration.database['fbc'].push(sd);
            });
        });
        $(xmlDoc).find('gl_email').each(function () {
            $(this).children().each(function () {
                var ea = {};
                ea.type = lz_global_base64_url_decode($(this).attr('t'));
                ea.id = lz_global_base64_url_decode($(this).attr('i'));
                ea.email = lz_global_base64_url_decode($(this).attr('e'));

                ea.host = lz_global_base64_url_decode($(this).attr('h'));
                ea.userName = lz_global_base64_url_decode($(this).attr('u'));
                ea.password = lz_global_base64_url_decode($(this).attr('p'));
                ea.port = lz_global_base64_url_decode($(this).attr('po'));
                ea.encrypt = lz_global_base64_url_decode($(this).attr('s'));

                if(ea.type.toLowerCase() == 'pop' || ea.type.toLowerCase() == 'imap')
                {
                    ea.boxtype = 'incoming';
                    ea.frequency = lz_global_base64_url_decode($(this).attr('c'));
                    ea.deleteDays = lz_global_base64_url_decode($(this).attr('d'));
                    ea.framework = ($(this).attr('f').length) ? lz_global_base64_url_decode($(this).attr('f')) : 'ZEND';
                }
                else
                {
                    ea.boxtype = 'outgoing';
                    ea.default = lz_global_base64_url_decode($(this).attr('de'))=='1';
                    ea.auth = lz_global_base64_url_decode($(this).attr('a'));
                    ea.senderName = lz_global_base64_url_decode($(this).attr('sn'));
                }
                thisClass.global_configuration.database['email'].push(ea);
            });
        });
    });
    return myHash;
};

ChatServerEvaluationClass.prototype.getConfigValue = function(key, toplevel){
    try
    {
    var i;
    toplevel = (d(toplevel)) ? toplevel : false;
    if(toplevel)
        for (i=0; i<this.global_configuration.toplevel.length; i++){
            if (this.global_configuration.toplevel[i].key == key)
                return this.global_configuration.toplevel[i];
        }
    else if(d(this.global_configuration.site))
        for (i=0; i<this.global_configuration.site[0].length; i++)
            if (this.global_configuration.site[0][i].key == key)
                return this.global_configuration.site[0][i].value;
    }
    catch(ex){//called too early
    }
    return null;
};

ChatServerEvaluationClass.prototype.getTranslationLanguages = function(translations) {
    var that = this, derivedLanguages = [], origKeys = [];
    that.translationLanguages = [];
    $(translations).children('language').each(function() {
        var language = $(this);
        var langData = {};
        var myAttributes = language[0].attributes;
        for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
            langData[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
        }
        langData.blocked = (typeof langData.blocked != 'undefined') ? parseInt(langData.blocked) : 0;
        langData.derived = (typeof langData.derived != 'undefined') ? parseInt(langData.derived) : 0;
        langData.m = parseInt(langData.m);
        if (langData.derived == 1) {
            derivedLanguages.push(langData);
        } else {
            that.translationLanguages.push(langData);
            origKeys.push(langData.key + '~' + langData.m);
        }
    });
    for (var i=0; i<derivedLanguages.length; i++) {
        if($.inArray(derivedLanguages[i].key + '~' + derivedLanguages[i].m, origKeys) == -1) {
            that.translationLanguages.push(derivedLanguages[i]);
        }
    }
};

ChatServerEvaluationClass.prototype.setConfigValues = function(global_config) {
    var i = 0, key = '', startPages = '';
    for (i=0; i<global_config.toplevel.length; i++) {
        for (key in global_config.toplevel[i].subkeys) {
            if (global_config.toplevel[i].subkeys.hasOwnProperty(key)) {
                if (key == 'poll_frequency_clients') {
                    this.pollFrequency = global_config.toplevel[i].subkeys[key];
                }
                if (key == 'timeout_clients') {
                    this.timeoutClients = global_config.toplevel[i].subkeys[key];
                }
                if (key == 'gl_site_name') {
                    this.siteName = global_config.toplevel[i].subkeys[key];
                    if (!doBlinkTitle) {
                        $('title').html(this.siteName);
                    }
                }
                if (key == 'gl_default_language') {
                    this.defaultLanguage = global_config.toplevel[i].subkeys[key];
                }
                /*
                if (key == 'gl_root')
                {
                    this.isRootServer = (global_config.toplevel[i].subkeys[key] == 1);
                }
                */

                if (key == 'gl_host')
                {
                    this.hostName = global_config.toplevel[i].subkeys[key];
                }

                if (this.maxOperatorNumber == null && key == 'ss_mnos') {
                    this.maxOperatorNumber = global_config.toplevel[i].subkeys[key];
                }
            }
        }
    }
    /*
    if (multiServerId == '' && !this.isRootServer && this.hostName != '') {
        multiServerId = lz_global_base64_url_encode(this.hostName);
    }
    */
};

ChatServerEvaluationClass.prototype.setOtrs = function(globalConfig) {
    var otrsKey = '';
    for (i=0; i<globalConfig.toplevel.length; i++) {
        if (typeof globalConfig.toplevel[i].subkeys == 'object') {
            if (typeof globalConfig.toplevel[i].subkeys['gl_otrs'] != 'undefined') {
                otrsKey = globalConfig.toplevel[i].subkeys['gl_otrs'];
            }
        }
    }
    if (otrsKey == '') {
        try {
            for (var i=0; i<globalConfig.site[0].length; i++) {
                if (globalConfig.site[0][i].key == 'gl_otrs') {
                    otrsKey = globalConfig.site[0][i].value;
                }
            }
        } catch(e) {}
    }
    this.otrs = otrsKey;
    UserActions.getTranslationLanguages();
};

ChatServerEvaluationClass.prototype.setStartPages = function(global_config) {
    var i = 0, j = 0, oldStartPages = lzm_commonTools.clone(lzm_chatDisplay.startPages), lzStartPageChange = false, startPages = '';
    for (i=0; i<global_config.toplevel.length; i++) {
        if (typeof global_config.toplevel[i].subkeys == 'object') {
            if (typeof global_config.toplevel[i].subkeys['gl_usrsp'] != 'undefined') {
                startPages = global_config.toplevel[i].subkeys['gl_usrsp'];
            }
        }
    }
    if (startPages == '') {
        try {
            for (i=0; i<global_config.site[0].length; i++) {
                if (global_config.site[0][i].key == 'gl_usrsp') {
                    startPages = global_config.site[0][i].value;
                }
            }
        } catch(e) {}
    }
    if (startPages == '') {
        lzm_chatDisplay.startPages.show_lz = '1';
        lzm_chatDisplay.startPages.others = [];
    } else if (startPages.indexOf('|') == -1) {
        lzm_chatDisplay.startPages.show_lz = lz_global_base64_url_decode(startPages);
        lzm_chatDisplay.startPages.others = [];
    } else {
        var startPageArray = startPages.split('|');
        lzm_chatDisplay.startPages.show_lz = lz_global_base64_url_decode(startPageArray[startPageArray.length - 1]);
        lzm_chatDisplay.startPages.others = [];
        for (i=0; i<startPageArray.length-1; i++) {
            var thisPage = lz_global_base64_url_decode(startPageArray[i]).split('|');
            var thisPageHash = md5(lz_global_base64_url_decode(thisPage[0]) + lz_global_base64_url_decode(thisPage[1]) + lz_global_base64_url_decode(thisPage[2]));
            lzm_chatDisplay.startPages.others.push({url: lz_global_base64_url_decode(thisPage[0]),
                title: lz_global_base64_url_decode(thisPage[1]), get_param: lz_global_base64_url_decode(thisPage[2]),
                hash: thisPageHash});
        }
    }
    if (oldStartPages.show_lz != lzm_chatDisplay.startPages.show_lz) {
        lzStartPageChange = true;
    }
    var customPagesWereAdded = [];
    var customPagesWereRemoved = [];
    for (i=0; i<lzm_chatDisplay.startPages.others.length; i++) {
        var thisCustomPageHasChanged = i;
        for (j=0; j<oldStartPages.others.length; j++) {
            if (oldStartPages.others[j].hash == lzm_chatDisplay.startPages.others[i].hash) {
                thisCustomPageHasChanged = -1;
            }
        }
        if (thisCustomPageHasChanged != -1) {
            customPagesWereAdded.push(lzm_chatDisplay.startPages.others[thisCustomPageHasChanged]);
        }
    }
    for (i=0; i<oldStartPages.others.length; i++) {
        var thisCustomPageWasRemoved = i;
        for (j=0; j<lzm_chatDisplay.startPages.others.length; j++) {
            if (oldStartPages.others[i].hash == lzm_chatDisplay.startPages.others[j].hash) {
                thisCustomPageWasRemoved = -1;
            }
        }
        if (thisCustomPageWasRemoved != -1) {
            customPagesWereRemoved.push(oldStartPages.others[thisCustomPageWasRemoved]);
        }

    }
    lzStartPageChange = (this.new_startpage.lz) ? this.new_startpage.lz : lzStartPageChange;
    this.new_startpage = {lz: lzStartPageChange, ca: customPagesWereAdded, cr: customPagesWereRemoved};
};

ChatServerEvaluationClass.prototype.getGlobalTyping = function(xmlDoc) {
    var myHash = '';

    $(xmlDoc).find('gl_typ').each(function () {
        var gl_typ = $(this);
        $(gl_typ).find('v').each(function()
        {
            var thisGlTyp = {
                id: lz_global_base64_url_decode($(this).attr('id')),
                tp: (lz_global_base64_url_decode($(this).attr('tp'))=='1')
            };

            var chatObj = DataEngine.ChatManager.GetChat(thisGlTyp.id,'SystemId');
            if(chatObj != null)
            {
                if(thisGlTyp.tp != chatObj.IndicateTyping)
                {
                    chatObj.IndicateTyping = thisGlTyp.tp;
                    if(ChatManager.ActiveChat == chatObj.SystemId && lzm_chatDisplay.selected_view == 'mychats')
                    {
                        OpenChatTab(chatObj.SystemId);
                    }
                }
            }
        });
        myHash = lz_global_base64_url_decode(gl_typ.attr('h'));
    });

    return myHash;
};

ChatServerEvaluationClass.prototype.getGlobalErrors = function (xmlDoc) {
    var thisClass = this;
    var myHash = '';
    $(xmlDoc).find('gl_e').each(function () {
        thisClass.new_gl_e = true;
        var gl_e = $(this);
        thisClass.global_errors = [];
        $(gl_e).find('val').each(function () {
            var val = $(this);
            thisClass.global_errors.push(lz_global_base64_url_decode(val.attr('err')));
        });

        myHash = lz_global_base64_url_decode(gl_e.attr('h'));
    });
    return myHash;
};

ChatServerEvaluationClass.prototype.addLinks = function(myText) {
    var i, j, replacement;
    var webSites = myText.match(/(www\.|(http|https):\/\/)[.a-z0-9-]+\.[a-z0-9\/_:@=.+?,##%&~-]*[^.|'|# |!|\(|?|,| |>|<|;|\)]/gi);
    //var webSites = myText.match(/(www\.|(http|https):\/\/)[.a-z0-9-]+\.[a-z0-9\/_:@=.+?,##%&\[\]\{\}\(\)~-]*[^.|'|# |!|\(|?|,| |>|<|;|\)]/gi);
    var existingLinks = myText.match(/<a.*?href.*?>.*?<\/a>/gi);
    if (typeof webSites != 'undefined' && webSites != null) {
        for (i=0; i<webSites.length; i++) {
            var replaceLink = true;
            if (typeof existingLinks != 'undefined' && existingLinks != null) {
                for (j=0;j<existingLinks.length; j++) {
                    if (existingLinks[j].indexOf(webSites[i])) {
                        replaceLink = false;
                    }
                }
            }
            if (replaceLink) {
                if (webSites[i].toLowerCase().indexOf('http') != 0) {
                    replacement = '<a target="_blank" class="lz_chat_link" href="http://' + webSites[i] + '" data-url="http://' + webSites[i] + '">' + webSites[i] + '</a>';
                } else {
                    replacement = '<a target="_blank" class="lz_chat_link" href="' + webSites[i] + '" data-url="' + webSites[i] + '">' + webSites[i] + '</a>';
                }
                myText = myText.replace(webSites[i], replacement);
            }
        }
    }

    var mailAddresses = myText.match(/[\w\.-]{1,}@[\w\.-]{2,}\.\w{2,3}/gi);
    if (typeof mailAddresses != 'undefined' && mailAddresses != null) {
        for (i=0; i<mailAddresses.length; i++) {
            replacement = '<a target="_blank" class="lz_chat_mail" href="mailto:' + mailAddresses[i] + '" data-url="mailto:' + mailAddresses[i] + '">' + mailAddresses[i] + '</a>';
            myText = myText.replace(mailAddresses[i], replacement);
        }
    }
    if (myText.match(/<a.*?href=".*?".+?data\-url=".*?".+?>.*?<\/a>/i) != null) {
        myText = myText.replace(/<a(.*?)href="(.*?)".*?data\-url="(.*?)"(.+?)>(.*?)<\/a>/gi, '<a target="_blank"$1href="$3" data-url="$3"$4>$5</a>');
    } else if (myText.match(/<a.*?href=".*?".+?data\-url=".*?">.*?<\/a>/i) != null) {
        myText = myText.replace(/<a(.*?)href="(.*?)".*?data\-url="(.*?)">(.*?)<\/a>/gi, '<a target="_blank"$1href="$3" data-url="$3">$4</a>');
    }
    myText = myText.replace(/<a(.*?)href="(.*?)">(.*?)<\/a>/gi, '<a target="_blank"$1href="$2">$3</a>');
    myText = myText.replace(/<a(.*?)href="(.*?)"(.+?)>(.*?)<\/a>/gi, '<a target="_blank"$1href="$2"$3>$4</a>');
    myText = myText.replace(/(target="_blank" )+/gi, 'target="_blank" ');
    return myText;
};

ChatServerEvaluationClass.prototype.replaceLinks = function(myText) {
    var i, replacement;
    var links = myText.match(/<[aA].*?href.*?<\/[aA]>/);
    if (typeof links != 'undefined' && links != null) {
        for (i=0; i<links.length; i++) {
            var address, shownText;
            if (links[i].indexOf('mailto:') == -1) {
                address = links[i].match(/href=".*?"/);
                if (typeof address == 'undefined' || address == null) {
                    address = links[i].match(/href='.*?'/)[0].replace(/^href='/,'').replace(/'$/, '');
                } else {
                    address = address[0].replace(/^href="/,'').replace(/"$/, '');
                }
                address = address.replace(/ *$/,'').replace(/"*$/,'');
                shownText = links[i].match(/>.*?<\/[aA]>/);
                if (typeof shownText == 'undefined' || shownText == null) {
                    shownText = links[i].match(/href='.*?'/);
                }
                shownText = shownText[0].replace(/^>/,'').replace(/<\/[aA]>$/,'');
                if (links[i].indexOf('lz_chat_file') == -1) {
                    replacement = '<a data-role="none" class="lz_chat_link" href="#" onclick="openLink(\'' + address + '\')">' + shownText + '</a>';
                } else {
                    replacement = '<a data-role="none" class="lz_chat_file" href="#" onclick="downloadFile(\'' + address + '\')">' + shownText + '</a>';
                }
                if (address != '#') {
                    myText = myText.replace(links[i], replacement);
                }
            } else {
                var address2 = links[i].match(/href=".*?"/);
                var address1 = links[i].match(/href='.*?'/);
                var address0 = links[i].match(/href=.*? /);
                if ((typeof address2 == 'undefined' || address2 == null) && (typeof address1 == 'undefined' || address1 == null)) {
                    address = address0[0].replace(/^href=/,'').replace(/ $/, '');
                } else if (typeof address2 == 'undefined' || address2 == null) {
                    address = address1[0].replace(/^href='/,'').replace(/'$/, '');
                } else {
                    address = address2[0].replace(/^href="/,'').replace(/"$/, '');
                }
                address = address.replace(/ *$/,'').replace(/"*$/,'');
                shownText = links[i].match(/>.*?<\/[aA]>/);
                if (typeof shownText == 'undefined' || shownText == null) {
                    shownText = links[i].match(/href='.*?'/);
                }
                shownText = shownText[0].replace(/^>/,'').replace(/<\/[aA]>$/,'');
                replacement = '<a data-role="none" class="lz_chat_mail" href="#" onclick="openLink(\'' + address + '\')">' + shownText + '</a>';
                if (address != '#') {
                    myText = myText.replace(links[i], replacement);
                }
            }
        }
    }
    return myText;
};

ChatServerEvaluationClass.prototype.deletePropertyFromChatObject = function (propertyName) {
    this.userChats.removeUserChat(propertyName);
};

ChatServerEvaluationClass.prototype.getTranslationStrings = function(xmlDoc) {
    var that = this;
    $(xmlDoc).find('response').each(function() {
        var response = $(this);
        response.find('language').each(function() {
            var language = $(this);
            var key = lz_global_base64_url_decode(language.attr('key'));
            that.translationStrings.key = (key != 'orig') ? key : 'en';
            language.children('val').each(function() {
                var val = $(this);
                that.translationStrings.strings[lz_global_base64_url_decode(val.attr('key'))] = lz_global_base64_url_decode(val.text());
                that.new_trl = true;
            });
        });
    });
};

ChatServerEvaluationClass.prototype.getServerUrl = function(filename) {
    filename = (typeof filename != 'undefined') ? filename : '';
    return this.serverProtocol + this.serverUrl.replace(':80','').replace(':443','') + '/' + filename;
};

ChatServerEvaluationClass.prototype.ProcessVisitors = function (xmlDoc) {
    $(xmlDoc).find('v_users').each(function () {
        VisitorManager.UpdateUI = true;
        var visitorList = $(this);
        $(visitorList).find('v').each(function () {

            var visitorXML = $(this);
            var visObj = {};
            lzm_commonTools.ApplyFromXML(visObj,visitorXML[0].attributes);
            visObj.id = visObj.i;

            var dataObj = {};
            $(visitorXML).find('d').each(function () {
                var dataXML = $(this);
                lzm_commonTools.ApplyFromXML(dataObj,dataXML[0].attributes);
            });

            visObj.d = dataObj;

            VisitorManager.AddVisitor(visObj);

            $(visitorXML).find('c').each(function () {
                var comXML = $(this);
                var comObj = {};
                lzm_commonTools.ApplyFromXML(comObj,comXML[0].attributes);
                comObj.text = lz_global_base64_url_decode(comXML.text());
                VisitorManager.AddComment(visObj.i,comObj);
            });
            $(visitorXML).find('r').each(function () {
                var inviteXML = $(this);
                var invObj = {};
                lzm_commonTools.ApplyFromXML(invObj,inviteXML[0].attributes);
                VisitorManager.AddInvite(visObj.i,invObj);
            });
        });
        $(visitorList).find('rv').each(function () {
            var rvXML = $(this);
            var rvObj = {};
            lzm_commonTools.ApplyFromXML(rvObj,rvXML[0].attributes);
            var vis = VisitorManager.GetVisitor(rvObj.v);
            if(vis != null)
            {
                if(!d(vis.rv))
                    vis.rv = [];
                vis.rv.push(rvObj);
            }
        });
        $(visitorList).find('dut').each(function () {
            var dutXML = $(this);
            var dut = {};
            lzm_commonTools.ApplyFromXML(dut,dutXML[0].attributes);
            VisitorManager.DUTVisitors = Math.max(VisitorManager.DUTVisitors,dut.e);
        });

    });
    $(xmlDoc).find('v_browsers').each(function () {
        VisitorManager.UpdateUI = true;
        var browserList = $(this);
        $(browserList).find('b').each(function () {

            var browserXML = $(this);
            var brObj = {};
            lzm_commonTools.ApplyFromXML(brObj,browserXML[0].attributes);
            VisitorManager.AddBrowser(brObj);
        });
        $(browserList).find('dut').each(function () {

            var dutXML = $(this);
            var dut = {};
            lzm_commonTools.ApplyFromXML(dut,dutXML[0].attributes);
            VisitorManager.DUTVisitorBrowserEntrance = Math.max(VisitorManager.DUTVisitorBrowserEntrance,dut.e);
        });
    });
    $(xmlDoc).find('v_urls').each(function () {
        VisitorManager.UpdateUI = true;
        var urlList = $(this);
        $(urlList).find('h').each(function () {
            var urlXML = $(this);
            var urlObj = {ref:{u:''}};
            lzm_commonTools.ApplyFromXML(urlObj,urlXML[0].attributes);

            $(urlXML).find('ref').each(function () {
                var refXML = $(this);
                urlObj.ref = {};
                lzm_commonTools.ApplyFromXML(urlObj.ref,refXML[0].attributes);
            });
            VisitorManager.AddURL(urlObj);
        });
    });

    VisitorManager.Calculate();
    VisitorManager.PruneVisitors();

    if (VisitorManager.UpdateUI)
    {
        var visD,visE;
        if(lzm_chatDisplay.selected_view == 'external' || lzm_chatDisplay.selected_view == 'archive')
        {
            visD = VisitorManager.GetVisitor(ChatVisitorClass.VisitorInformationId);
            if (visD != null && visD.is_vi_ui_update)
            {
                lzm_chatDisplay.VisitorsUI.UpdateVisitorInformation(visD,false);
            }
        }

        $('#chat-info-elements div').each(function(){
            var vid = $(this).attr('data-visitor-id');
            if(d(vid))
            {
                visE = VisitorManager.GetVisitor(vid);
                if(visE != null && visE.is_vi_ui_update)
                {
                    lzm_chatDisplay.VisitorsUI.UpdateVisitorInformation(visE,false);
                }
            }
        });

        if(visD!=null)
            visD.is_vi_ui_update = false;
        if(visE!=null)
            visE.is_vi_ui_update = false;
    }
};

ChatServerEvaluationClass.prototype.createUniqueName = function(idString) {
    // DEPRECATED
    var mod = 111;
    var digit;
    for (var i=0; i<idString.length; i++) {
        digit = 0;
        if (!isNaN(parseInt(idString.substr(i,1)))) {
            digit = parseInt(idString.substr(i,1));
            mod = (mod + (mod* (16+digit)) % 1000);
            if (mod % 10 == 0) {
                mod += 1;
            }
        }
    }
    return String(mod).substr(String(mod).length-4,4);
};

ChatServerEvaluationClass.prototype.getChats = function (xmlDoc, customDemandTocken) {
    var thisClass = this;
    var chatReturn = {dut: ''};
    $(xmlDoc).find('ext_c').each(function ()
    {
        var ext_c = $(this);
        // main archive view
        $(ext_c).children('dc').each(function () {
            if(!customDemandTocken)
            {
                thisClass.chatArchive = {chats: [], q: '', p: 20, t: 0};
                var myAttributes = $(this)[0].attributes;
                for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
                    if (myAttributes[attrIndex].name == 'dut')
                        chatReturn['dut'] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
                    thisClass.chatArchive[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
                }
                $(this).children('c').each(function () {
                    var c = $(this);
                    thisClass.chatArchive.chats.push(thisClass.addArchivedChat(c));
                });
                thisClass.new_dc = true;
                thisClass.expectArchiveChanges = false;
            }
            else
            {
                /*
                lzm_chatDisplay.archiveControlChats[customDemandTocken] = [];
                $(this).children('c').each(function () {
                    var c = $(this);
                    lzm_chatDisplay.archiveControlChats[customDemandTocken].push(thisClass.addArchivedChat(c));
                });
                */
            }
        });

        // load full object data
        $(ext_c).children('ac').each(function () {

            var ac = $(this);
            var userid = lz_global_base64_url_decode(ac.attr('id'));
            var visitorObj = VisitorManager.GetVisitor(userid);
            if(visitorObj != null)
            {
                // archived visitor chats
                if(!d(visitorObj.ArchivedChats))
                    visitorObj.ArchivedChats = [];

                $(this).children('c').each(function () {
                    var c = $(this);
                    var acobj = thisClass.addArchivedChat(c);
                    var exacc = lzm_commonTools.GetElementByProperty(visitorObj.ArchivedChats,'cid',acobj.cid);
                    if(!exacc.length)
                        visitorObj.ArchivedChats.push(acobj);
                });
            }
            else
            {
                // archived internal chats
                lzm_chatDisplay.archiveControlChats[userid] = [];
                $(this).children('c').each(function () {
                    var c = $(this);
                    lzm_chatDisplay.archiveControlChats[userid].push(thisClass.addArchivedChat(c));
                });
                if(lzm_chatDisplay.archiveControlChats[userid].length && ChatVisitorClass.VisitorInformationId == userid)
                    lzm_chatDisplay.VisitorsUI.UpdateVisitorInformation({id:userid},true);
            }
        });
    });
    if (thisClass.expectArchiveChanges)
        thisClass.expectArchiveChanges = false;
    else
        thisClass.archiveFetchTime = lzm_chatTimeStamp.getServerTimeString(null, false, 1);

    return chatReturn;
};

ChatServerEvaluationClass.prototype.addArchivedChat = function(c) {
    var new_c = {cc: []};
    var myAttributes = c[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++)
        new_c[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    c.children('chtml').each(function() {
        new_c.chtml = lz_global_base64_url_decode($(this).text());//thisClass.replaceLinks(lz_global_base64_url_decode($(this).text()));
    });
    c.children('cplain').each(function() {
        new_c.cplain = lz_global_base64_url_decode($(this).text());
    });
    c.children('cc').each(function() {
        var new_cc = {cuid: lz_global_base64_url_decode($(this).attr('cuid')), text: lz_global_base64_url_decode($(this).text())};
        new_c.cc.push(new_cc);
    });
    return new_c;
};

ChatServerEvaluationClass.prototype.getResources = function (xmlDoc) {
    var thisClass = this;
    var publicFolder = {
        di: "0",
        ed: "0",
        eid: "0000000",
        oid: "0000000",
        pid: "0",
        ra: "0",
        rid: "1",
        si: "6",
        t: "",
        text: t('Public'),
        ti: t('Public'),
        ty: "0"
    };
    var newResCount = 0;
    thisClass.cannedResources.setResource(publicFolder);
    $(xmlDoc).find('ext_res').each(function() {
        var ext_res = $(this);
        $(ext_res).find('r').each(function () {
            thisClass.new_qrd = true;
            newResCount++;
            var new_r = {};
            var myAttributes = $(this)[0].attributes;
            for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
                new_r[myAttributes[attrIndex].name] = lz_global_base64_decode(myAttributes[attrIndex].value);
            }
            new_r.text = lz_global_base64_decode($(this).text());
            var serializedXmlString = (new XMLSerializer()).serializeToString(this);
            new_r.md5 = md5(serializedXmlString);

            if (new_r.di == 0)
            {
                thisClass.cannedResources.setResource(new_r);
            }
            if (new_r.di != 0 && new_r.disc != 0)
            {
                thisClass.cannedResources.removeResource(new_r.rid);
            }

            var editedTime = (typeof new_r.ed != 'undefined') ? new_r.ed : 0;
            thisClass.resourceLastEdited = Math.max(thisClass.resourceLastEdited, editedTime);
        });
    });

    if(newResCount>0){
        lzm_commonStorage.saveValue('qrd_' + DataEngine.myId, JSON.stringify(DataEngine.cannedResources.getResourceList('',{},true)));
        lzm_commonStorage.saveValue('qrd_request_time_' + DataEngine.myId, JSON.stringify(DataEngine.resourceLastEdited));
    }
    return thisClass.resourceLastEdited;
};

ChatServerEvaluationClass.prototype.getReports = function(xmlDoc) {
    var that = this, myDut = '';
    try {
    $(xmlDoc).find('dr').each(function() {
        var dr = $(this);
        that.reports.clearReports();
        $(dr).children('r').each(function() {
            var r = $(this);
            that.reports.setReport(that.addReport(r));
        });
        var reportGlobalValues = {};
        var myAttributes = dr[0].attributes;
        for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
            reportGlobalValues[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
        }
        that.reports.setTotal(reportGlobalValues.t);
        that.reports.setMatching(reportGlobalValues.q);
        that.reports.setReportsPerPage(reportGlobalValues.p);
        myDut = reportGlobalValues.dut;
        that.new_dr = true;
        that.expectReportChanges = false;
    });
    } catch(ex) {}
    if (that.expectReportChanges) {
        that.expectReportChanges = false;
    } else {
        that.reportFetchTime = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
    }
    return myDut;
};

ChatServerEvaluationClass.prototype.addReport = function(r) {
    var that = this, newReport = {};
    var myAttributes = r[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newReport[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    return newReport;
};

ChatServerEvaluationClass.prototype.getFilters = function(xmlDoc) {
    var thisClass = this, myDut = '';
    var filterHash = '';
    $(xmlDoc).find('ext_b').each(function() {
        thisClass.new_ext_b = true;
        var ext_b = $(this);
        filterHash = lz_global_base64_url_decode(ext_b.attr('h'));
        thisClass.filters.clearFilters();
        var filterGlobalValues = {};
        ext_b.find('dfi').each(function() {
            var dfi = $(this);
            var myAttributes = dfi[0].attributes;
            for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
                filterGlobalValues[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
            }
            dfi.find('val').each(function() {
                var newFilter = thisClass.addFilter($(this));
                thisClass.filters.setFilter(newFilter);
             });
        });
        myDut = filterGlobalValues.dut;
    });
    return {hash: filterHash, dut: myDut};
};

ChatServerEvaluationClass.prototype.processActions = function(xmlDoc) {
    var that = this,key,akey,ia,ev,ac,aid;
    $(xmlDoc).find('int_ac').each(function() {

        var int_ac = $(this);
        int_ac.find('ia').each(function() {

            ia = $(this);
            aid = lz_global_base64_url_decode(ia.attr('aid'));

            for(key in that.eventList)
            {
                ev = that.eventList[key];
                for(akey in ev.Actions)
                {
                    ac = ev.Actions[akey];
                    if(ac.id == aid)
                    {
                        if(ac.type=='0'){
                            function a()
                            {
                                that.eventActionShowAlert = true;
                                lzm_commonDialog.createAlertDialog('<b>' + ev.name + ':</b><br><br>' + ac.val, [{id: 'ok', name: t('Ok')}]);
                                $('#alert-btn-ok').click(function() {
                                    that.eventActionShowAlert = false;
                                    lzm_commonDialog.removeAlertDialog();
                                });
                            }
                            if(!that.eventActionShowAlert)
                                a();
                        }
                        else if(ac.type=='1'){
                            function b()
                            {
                                $('#event_action_audio').remove();
                                var sound = document.createElement('audio');
                                sound.setAttribute('src',ac.val);
                                sound.id='event_action_audio';
                                sound.setAttribute('autoplay','true');
                                document.body.appendChild(sound);
                            }
                            b();
                        }
                    }
                }
            }
        });
    });
};

ChatServerEvaluationClass.prototype.addFilter = function(val) {
    var newFilter = {};
    var myAttributes = val[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newFilter[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    return newFilter;
};

ChatServerEvaluationClass.prototype.getEvents = function(xmlDoc) {
    var thisClass = this;
    var myEventDut = '';
    $(xmlDoc).find('listen').each(function() {
        var listen = $(this);
        var evList = listen.children('ev');
        evList.each(function() {
            var evl = $(this);
            myEventDut = lz_global_base64_url_decode(evl.attr('dut'));
            var doUpdate = !d(evl.attr('nu'));
            var evs = evl.children('ev');
            if(doUpdate){
                thisClass.new_ev = true;
                thisClass.eventList = [];
                evs.each(function() {
                    var ev = $(this);
                    ev = thisClass.addEvent(ev);
                    thisClass.eventList.push(ev);
                });
            }
        });
    });
    return {'event-dut': myEventDut};
};

ChatServerEvaluationClass.prototype.addEvent = function(val) {
    var newEvent = {};
    newEvent.Actions = [];
    newEvent.Goals = [];
    newEvent.DataConditions = [];
    newEvent.URLConditions = [];
    lzm_commonTools.ApplyFromXML(newEvent,val[0].attributes);
    val.children().each(function() {
        var subE = $(this);

        // actions
        if(subE[0].nodeName == 'evac'){
            var evAction = {};
            evAction.Invites = [];
            evAction.Overlays = [];
            evAction.Pushs = [];
            evAction.Receivers = [];
            lzm_commonTools.ApplyFromXML(evAction,subE[0].attributes,subE);
            subE.children().each(function() {
                var subActionE = $(this);
                if(subActionE[0].nodeName == 'evinv'){
                    var evActionInv = {};
                    evActionInv.Senders = [];
                    evActionInv.SenderGroupId = '';
                    lzm_commonTools.ApplyFromXML(evActionInv,subActionE[0].attributes,subActionE);
                    subActionE.children('evinvs').each(function() {
                        var invSenderE = $(this);
                        var invSender = {};
                        lzm_commonTools.ApplyFromXML(invSender,invSenderE[0].attributes,invSenderE);
                        if(!invSender.userid.length)
                            evActionInv.SenderGroupId = invSender.groupid;
                        evActionInv.Senders.push(invSender);
                    });
                    evAction.Invites.push(evActionInv);
                }
                else if(subActionE[0].nodeName == 'evolb'){
                    var evActionOvlb = {};
                    lzm_commonTools.ApplyFromXML(evActionOvlb,subActionE[0].attributes,subActionE);
                    evAction.Overlays.push(evActionOvlb);
                }
                else if(subActionE[0].nodeName == 'evwp'){
                    var evActionWp = {};
                    evActionWp.Senders = [];
                    var subActionP = $(this);
                    lzm_commonTools.ApplyFromXML(evActionWp,subActionE[0].attributes,subActionE);
                    subActionP.children().each(function() {
                        var pushSenderE = $(this);
                        var pushSender = {};
                        lzm_commonTools.ApplyFromXML(pushSender,pushSenderE[0].attributes,pushSenderE);
                        evActionWp.Senders.push(pushSender);
                    });
                    evAction.Pushs.push(evActionWp);
                }
                else if(subActionE[0].nodeName == 'evr'){
                    var evActionRec = {};
                    lzm_commonTools.ApplyFromXML(evActionRec,subActionE[0].attributes,subActionE);
                    evAction.Receivers.push(evActionRec);
                }
            });
            newEvent.Actions.push(evAction);
        }
        // event url
        else if(subE[0].nodeName == 'evur'){
            var evURL = {};
            lzm_commonTools.ApplyFromXML(evURL,subE[0].attributes,subE);
            newEvent.URLConditions.push(evURL);
        }
        // goals
        else if(subE[0].nodeName == 'evg'){
            var goal = {};
            lzm_commonTools.ApplyFromXML(goal,subE[0].attributes,subE);
            newEvent.Goals.push(goal);
        }
        else if(subE[0].nodeName == 'dc'){
            var cond = {};
            lzm_commonTools.ApplyFromXML(cond,subE[0].attributes,subE);
            cond.id=lzm_commonTools.guid();
            newEvent.DataConditions.push(cond);
        }
    });
    return newEvent;
};

ChatServerEvaluationClass.prototype.getFeedbacks = function(xmlDoc) {
    var that = this;
    var myFeedbacksDut = '';
    $(xmlDoc).find('ext_fb').each(function() {
        var listen = $(this);
        var fbList = listen.children('dfb');
        fbList.each(function() {
            var fbl = $(this);
            myFeedbacksDut = lz_global_base64_url_decode(fbl.attr('dut'));
            that.feedbacksTotal = lz_global_base64_url_decode(fbl.attr('t'));

            var fbs = fbl.children('fb');
            that.new_fb = true;
            that.feedbacksList = [];
            fbs.each(function() {
                var fb = $(this);
                fb = that.addFeedback(fb);
                that.feedbacksList.push(fb);
                that.feedbacksMaxCreated = Math.max(that.feedbacksMaxCreated,fb.cr);
            });

        });
    });
    return {'feedbacks-dut': myFeedbacksDut};
};

ChatServerEvaluationClass.prototype.addFeedback = function(val) {
    var newFeedback = {};
    newFeedback.UserData = {f111:'-',f112:'-',f113:'-',f114:'-',f116:'-'};
    newFeedback.Criteria = [];
    lzm_commonTools.ApplyFromXML(newFeedback,val[0].attributes);
    var sList = val.children();
    sList.each(function() {
        var subN = $(this);
        if(subN[0].nodeName == 'd')
            lzm_commonTools.ApplyFromXML(newFeedback.UserData,subN[0].attributes);
        else if(subN[0].nodeName == 'v'){
            var crit = {};
            lzm_commonTools.ApplyFromXML(crit,subN[0].attributes,subN);
            newFeedback.Criteria.push(crit);
        }
    });
    return newFeedback;
};

ChatServerEvaluationClass.prototype.getUsrP = function (xmlDoc) {
    var thisClass = this;
    $(xmlDoc).find('usr_p').each(function () {
        thisClass.new_usr_p = true;
        var usr_p = $(this);
        $(usr_p).find('val').each(function () {
            var val = $(this);
            thisClass.addUsrP(val);
        });
    });
};

ChatServerEvaluationClass.prototype.addUsrP = function (val) {

    var thisClass = this,new_chat = {},myAttributes = val[0].attributes,chatObj;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++)
        new_chat[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);

    new_chat = Chat.FormatPost(new_chat);

    if (new_chat.sen.indexOf('~') != -1)
    {
        new_chat.sen_id = new_chat.sen.split('~')[0];
        new_chat.sen_b_id = new_chat.sen.split('~')[1];
    }
    else
    {
        new_chat.sen_id = new_chat.sen;
        new_chat.sen_b_id = '';
    }
    if (new_chat.rec != '' && new_chat.rec != new_chat.sen && new_chat.rec != new_chat.reco)
    {
        new_chat.sen_id = new_chat.rec;
        new_chat.sen_b_id = '';
    }

    new_chat.text = lz_global_htmlentities(lz_global_base64_url_decode(val.text()));
    new_chat.textOriginal = lz_global_base64_url_decode(val.text());

    this.rec_posts.push(new_chat.id);

    new_chat = Chat.ProcessPostCommands(new_chat);

    if(new_chat==null)
        return;

    var playSound = true;
    var chatFrameId = (new_chat.rec.length) ? new_chat.rec : new_chat.reco;

    chatObj = this.ChatManager.GetChat(chatFrameId);

    if(chatObj == null && chatFrameId.indexOf('~') == -1)
    {
        if(chatFrameId == thisClass.myId)
            chatFrameId = new_chat.sen_id;

        var group = thisClass.groups.getGroup(chatFrameId);
        var operator = thisClass.operators.getOperator(chatFrameId);

        if(group != null || chatFrameId == 'everyoneintern')
        {
            this.ChatManager.AddInternalChat(chatFrameId,Chat.ChatGroup);
        }
        else if(operator != null)
        {
            this.ChatManager.AddInternalChat(chatFrameId,Chat.Operator);
        }
        chatObj = this.ChatManager.GetChat(chatFrameId);
        chatObj.OpenChatTab();
    }
    else if(chatObj != null && chatObj.Type == Chat.Visitor && !chatObj.IsAccepted())
    {
        playSound = false;
    }
    else if(chatObj == null)
    {
        playSound = false;
    }

    if(chatObj != null)
        chatObj.AddMessage(new_chat,true);

    if (playSound && new_chat.reco == thisClass.myId && new_chat.rp != 1)
    {
        NotificationManager.NotifyChat(chatObj,new_chat);
        lzm_chatDisplay.createViewSelectPanel();
    }
};

ChatServerEvaluationClass.prototype.getDepartments = function (xmlDoc) {
    var thisClass = this;
    var myHash = '';
    var invalidateHash = false;
    $(xmlDoc).find('int_d').each(function ()
    {
        var newGroupIdList = [];
        thisClass.new_int_d = true;
        thisClass.groups.clearGroups();
        var int_d = $(this);
        $(int_d).find('v').each(function () {
            try {
                var v = $(this);
                var newGroup = thisClass.commonEvaluation.addDepartment(v);
                if(!thisClass.groups.setGroup(newGroup))
                {
                    invalidateHash = true;
                }
                newGroupIdList.push(newGroup.id);
            }
            catch(e) {deblog(e);}
        });

        myHash = lz_global_base64_url_decode(int_d.attr('h'));
        if (thisClass.oldGroupIdList.length != 0) {
            var removedGroupList = [], addedGroupList = [], i;
            for (i=0; i<thisClass.oldGroupIdList.length; i++) {
                if ($.inArray(thisClass.oldGroupIdList[i], newGroupIdList) == -1) {
                    removedGroupList.push(thisClass.oldGroupIdList[i]);
                }
            }
            for (i=0; i<newGroupIdList.length; i++) {
                if ($.inArray(newGroupIdList[i], thisClass.oldGroupIdList) == -1) {
                    addedGroupList.push(newGroupIdList[i]);
                }
            }
        }
        thisClass.oldGroupIdList = newGroupIdList;
    });

    if(invalidateHash)
        myHash = '';

    return myHash;
};

ChatServerEvaluationClass.prototype.checkMyDynamicGroups = function(group) {
    /*
    var rtValue = false, meIsIn = false;
    if (group != null && typeof group.members != 'undefined') {
        for (var i=0; i<group.members.length; i++) {
            meIsIn = meIsIn || (group.members[i].i == this.myId);
        }
    }
    if (meIsIn && $.inArray(group.id, this.myDynamicGroups) == -1) {
        this.myDynamicGroups.push(group.id);
        rtValue = true;
    }
    return rtValue;
    */
};

ChatServerEvaluationClass.prototype.getInternalUsers = function (xmlDoc) {
    var thisClass = this;
    var myHash = '';
    $(xmlDoc).find('int_r').each(function ()
    {

        var oldList = lzm_commonTools.clone(thisClass.operators.objects);
        thisClass.new_int_u = true;
        thisClass.operators.clearOperators();
        var int_r = $(this);
        $(int_r).find('v').each(function ()
        {
            var v = $(this);
            var newOperator = thisClass.commonEvaluation.addInternalUser(v);

            thisClass.operators.setOperator(newOperator,oldList);
            if (thisClass.myEmail == '' && newOperator.id == thisClass.myId) {
                thisClass.myEmail = newOperator.email;
            }
        });

        myHash = lz_global_base64_url_decode(int_r.attr('h'));
    });
    if (thisClass.otrs == null)
        thisClass.setOtrs(thisClass.global_configuration);
    return myHash;
};

ChatServerEvaluationClass.prototype.getIntWp = function (xmlDoc) {
    var thisClass = this;
    var myHash = '';
    $(xmlDoc).find('int_wp').each(function () {
        var int_wp = $(this);
        thisClass.wps = [];
        $(int_wp).find('v').each(function () {
            var v = $(this);
            thisClass.wps.push(thisClass.addWP(v));
        });

        myHash = lz_global_base64_url_decode(int_wp.attr('h'));
    });
    return myHash;
};

ChatServerEvaluationClass.prototype.addWP = function (v) {
    var new_wp = {};
    var myAttributes = v[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        new_wp[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value)
    }
    return new_wp;
};

ChatServerEvaluationClass.prototype.getTickets = function(xmlDoc, maxRead, customDemandTocken) {

    var that = this;
    var firstPoll = typeof this.ticketGlobalValues['updating'] == 'undefined';
    var myHash = '', myTicketDut = '', myEmailDut = '';
    var tlmc = (typeof that.ticketGlobalValues['tlmc'] != 'undefined' && that.ticketGlobalValues['tlmc'] != '') ? that.ticketGlobalValues['tlmc'] : 0;
    var elmc = (typeof that.ticketGlobalValues['elmc'] != 'undefined' && that.ticketGlobalValues['elmc'] != '') ? that.ticketGlobalValues['elmc'] : 0;
    that.ticketGlobalValues['updating'] = false;
    that.ticketGlobalValues['no_update'] = false;
    that.ticketGlobalValues['mr'] = maxRead;

    // archived tickets
    $(xmlDoc).find('at').each(function () {
        var at = $(this);
        var userid = lz_global_base64_url_decode(at.attr('id'));
        var visitorObj = VisitorManager.GetVisitor(userid);

        if(visitorObj != null)
        {
            if(!d(visitorObj.ArchivedTickets))
                visitorObj.ArchivedTickets = [];

            $(at).find('val').each(function () {
                var val = $(this);
                var thisTicket = that.addTicket(val);
                visitorObj.ArchivedTickets.push(thisTicket);
            });
        }
    });

    $(xmlDoc).find('dt').each(function () {
        that.new_dt = true;
        var dt = $(this);
        $(dt).find('no_update').each(function() {
            that.ticketGlobalValues['no_update'] = true;
        });
        var globValues = {
            q: lz_global_base64_url_decode(dt.attr('q')),
            r: lz_global_base64_url_decode(dt.attr('r')),
            t: lz_global_base64_url_decode(dt.attr('t')),
            ta: lz_global_base64_url_decode(dt.attr('ta')),
            p: lz_global_base64_url_decode(dt.attr('p')),
            lmn: lz_global_base64_url_decode(dt.attr('lmn')),
            lmt: lz_global_base64_url_decode(dt.attr('lmt')),
            tm: lz_global_base64_url_decode(dt.attr('tm')),
            tmg: lz_global_base64_url_decode(dt.attr('tmg')),
            tst0: lz_global_base64_url_decode(dt.attr('tst0')),
            tst1: lz_global_base64_url_decode(dt.attr('tst1')),
            tst2: lz_global_base64_url_decode(dt.attr('tst2')),
            tst3: lz_global_base64_url_decode(dt.attr('tst3'))
        };

        tlmc = (parseInt(lz_global_base64_url_decode(dt.attr('lmc'))) > tlmc) ? parseInt(lz_global_base64_url_decode(dt.attr('lmc'))) : tlmc;
        if (!that.ticketGlobalValues['no_update'])
        {
            that.tickets = [];
            $(dt).find('updating').each(function() {
                that.ticketGlobalValues['updating'] = true;
            });
            that.ticketGlobalValues['t'] = (globValues['t'] != '' || typeof that.ticketGlobalValues['t'] == 'undefined') ? globValues['t'] : that.ticketGlobalValues['t'];
            that.ticketGlobalValues['ta'] = (globValues['ta'] != '' || typeof that.ticketGlobalValues['ta'] == 'undefined') ? globValues['ta'] : that.ticketGlobalValues['ta'];
            that.ticketGlobalValues['r'] = (globValues['r'] != '' || typeof that.ticketGlobalValues['r'] == 'undefined') ? globValues['r'] : that.ticketGlobalValues['r'];

            if(!customDemandTocken)
                that.ticketGlobalValues['q'] = (globValues['q'] != '' || typeof that.ticketGlobalValues['q'] == 'undefined') ? globValues['q'] : that.ticketGlobalValues['q'];

            that.ticketGlobalValues['p'] = (globValues['p'] != '' || typeof that.ticketGlobalValues['p'] == 'undefined') ? globValues['p'] : that.ticketGlobalValues['p'];
            that.ticketGlobalValues['tlmn'] = (globValues['lmn'] != '' || typeof that.ticketGlobalValues['tlmn'] == 'undefined') ? globValues['lmn'] : that.ticketGlobalValues['tlmn'];
            that.ticketGlobalValues['tlmt'] = (globValues['lmt'] != '' || typeof that.ticketGlobalValues['tlmt'] == 'undefined') ? globValues['lmt'] : that.ticketGlobalValues['tlmt'];
            that.ticketGlobalValues['ttm'] = (globValues['tm'] != '' || typeof that.ticketGlobalValues['ttm'] == 'undefined') ? globValues['tm'] : that.ticketGlobalValues['ttm'];
            that.ticketGlobalValues['ttmg'] = (globValues['tmg'] != '' || typeof that.ticketGlobalValues['ttmg'] == 'undefined') ? globValues['tmg'] : that.ticketGlobalValues['ttmg'];
            that.ticketGlobalValues['ttst0'] = (globValues['tst0'] != '' || typeof that.ticketGlobalValues['ttst0'] == 'undefined') ? globValues['tst0'] : that.ticketGlobalValues['ttst0'];
            that.ticketGlobalValues['ttst1'] = (globValues['tst1'] != '' || typeof that.ticketGlobalValues['ttst1'] == 'undefined') ? globValues['tst1'] : that.ticketGlobalValues['ttst1'];
            that.ticketGlobalValues['ttst2'] = (globValues['tst2'] != '' || typeof that.ticketGlobalValues['ttst2'] == 'undefined') ? globValues['tst2'] : that.ticketGlobalValues['ttst2'];
            that.ticketGlobalValues['ttst3'] = (globValues['tst3'] != '' || typeof that.ticketGlobalValues['ttst3'] == 'undefined') ? globValues['tst3'] : that.ticketGlobalValues['ttst3'];

            $(dt).find('val').each(function () {
                var thisTicketHash = md5((new XMLSerializer()).serializeToString(this));
                var val = $(this);
                var thisTicket = that.addTicket(val);
                thisTicket.md5 = thisTicketHash;
                that.tickets.push(thisTicket);
            });
            that.ticketWatchList = [];
            $(dt).find('wl').each(function () {
                that.ticketWatchListUpdated = lz_global_base64_url_decode($(this).text());
                $(this).find('w').each(function () {
                    that.ticketWatchList.push(lz_global_base64_url_decode($(this).text()));
                });
            });

            for(var key in DataEngine.global_configuration.database['tsd'])
            {
                var elem = 'ttsd' + DataEngine.global_configuration.database['tsd'][key].sid;
                if(typeof dt.attr(elem) != 'undefined')
                    that.ticketGlobalValues[elem] = lz_global_base64_url_decode(dt.attr(elem));
            }
        }

        myHash = lz_global_base64_url_decode(dt.attr('h'));
        myTicketDut = lz_global_base64_url_decode(dt.attr('dut'));
        that.ticketGlobalValues['h'] = myHash;
        that.ticketGlobalValues['dut'] = myTicketDut;
        that.expectTicketChanges = false;
    });
    $(xmlDoc).find('de').each(function () {
        that.new_de = true;
        var de = $(this);
        that.emails = [];
        $(de).find('e').each(function () {
            var e = $(this);
            that.emails.push(that.addEmail(e));
        });
        elmc = (parseInt(lz_global_base64_url_decode(de.attr('lmc'))) > elmc) ? parseInt(lz_global_base64_url_decode(de.attr('lmc'))) : elmc;
        myEmailDut = lz_global_base64_url_decode(de.attr('dut'));
        that.emailCount = lz_global_base64_url_decode(de.attr('c'));
        var elmt = lz_global_base64_url_decode(de.attr('lmt'));
        var elmn = lz_global_base64_url_decode(de.attr('lmn'));
        that.ticketGlobalValues['e'] = (that.emailCount !== '') ? that.emailCount : that.ticketGlobalValues['e'];
        that.ticketGlobalValues['elmn'] = (elmn != '' || typeof that.ticketGlobalValues['elmn'] == 'undefined') ?
                elmn : that.ticketGlobalValues['elmn'];
            that.ticketGlobalValues['elmt'] = (elmt != '' || typeof that.ticketGlobalValues['elmt'] == 'undefined') ? elmt : that.ticketGlobalValues['elmt'];
        that.emails.sort(lzm_commonTools.sortEmails);
    });
    that.ticketGlobalValues['tlmc'] = tlmc;
    that.ticketGlobalValues['elmc'] = elmc;

    if (that.expectTicketChanges)
        that.expectTicketChanges = false;
    else
        that.ticketFetchTime = lzm_chatTimeStamp.getServerTimeString(null, false, 1);

    var numberOfEmails = (typeof that.ticketGlobalValues.e != 'undefined') ? that.ticketGlobalValues.e : 0;
    var numberOfTickets = (typeof that.ticketGlobalValues.q != 'undefined') ? that.ticketGlobalValues.q : 0;

    if(firstPoll)
        lzm_chatDisplay.ticketDisplay.setNotifyNewTicket = true;

    if(!firstPoll && lzm_chatDisplay.ticketDisplay.setNotifyNewTicket){
        lzm_chatDisplay.ticketDisplay.setNotifyNewTicket = false;
        if(numberOfTickets > 0 || numberOfEmails > 0)
            if(lzm_chatDisplay.selected_view!='tickets')
                lzm_chatDisplay.ticketDisplay.notifyNewTicket = true;
    }
    return {hash: myHash, 'ticket-dut': myTicketDut, 'email-dut': myEmailDut};
};

ChatServerEvaluationClass.prototype.addTicket = function(val) {
    var thisClass = this;
    var newTicket = {};
    var myAttributes = val[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newTicket[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    newTicket.messages = [];
    $(val).find('m').each(function(){
        var m = $(this);
        newTicket.messages.push(thisClass.addTicketMessage(m));
    });
    newTicket.editor = false;
    $(val).find('cl').each(function() {
        var cl = $(this);
        newTicket.editor = thisClass.addTicketEditor(cl);
    });
    $(val).find('au').each(function() {
        var au = $(this);
        newTicket.AutoStatusUpdateTime = parseInt(lz_global_base64_url_decode(au.attr('t'))) + parseInt(lzm_chatTimeStamp.timeDifference);
        newTicket.AutoStatusUpdateStatus = lz_global_base64_url_decode(au.text());

    });
    newTicket.logs = [];
    $(val).find('lo').each(function() {
        newTicket.logs.push(thisClass.addTicketLog($(this)));
    });
    return newTicket;
};

ChatServerEvaluationClass.prototype.addEmail = function(e) {
    var thisClass = this;
    var newEmail = {text: '', attachment: []};
    var myAttributes = e[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newEmail[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    $(e).find('c').each(function() {
        newEmail.text = lz_global_base64_url_decode($(this).text());
    });
    $(e).find('a').each(function() {
        var a = $(this);
        newEmail.attachment.push(thisClass.addEmailAttachment(a));
    });

    return newEmail;
};

ChatServerEvaluationClass.prototype.addEmailAttachment = function (a) {
    var newAttachment = {};
    var myAttributes = a[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newAttachment[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    newAttachment.id = lz_global_base64_url_decode(a.text());
    return newAttachment;
};

ChatServerEvaluationClass.prototype.addTicketMessage = function(m) {
    var thisClass = this;
    var newMessage = {attachment: [], comment: [], customInput: []};
    var myAttributes = m[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newMessage[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }

    $(m).find('c').each(function() {
        var c = $(this);
        newMessage.customInput.push(thisClass.addTicketMessageCustomInput(c));
    });
    $(m).find('a').each(function() {
        var a = $(this);
        newMessage.attachment.push(thisClass.addTicketMessageAttachment(a));
    });
    $(m).find('co').each(function() {
        var co = $(this);
        newMessage.comment.push(thisClass.addTicketMessageComment(co));
    });
    return newMessage;
};

ChatServerEvaluationClass.prototype.addTicketLog = function(log) {
    var newlog = {};
    var myAttributes = log[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++)
        newlog[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    newlog.a = lzm_chatDisplay.ticketDisplay.logCategories[newlog.a];
    newlog.vn = lz_global_base64_url_decode(log.text());

    if(newlog.a == 'ChangeStatus'){
        newlog.vn = (newlog.vn != '') ? tid('ticket_status_' + newlog.vn) : '';
        newlog.v = (newlog.v != '') ? tid('ticket_status_' + newlog.v) : '';
    }

    if(newlog.a == 'ChangeChannel'){
        try{
            newlog.vn = (newlog.vn != '') ? lzm_commonTools.GetElementByProperty(ChatTicketClass.m_TicketChannels,'index',newlog.vn)[0].title : '';
            newlog.v = (newlog.v != '') ? lzm_commonTools.GetElementByProperty(ChatTicketClass.m_TicketChannels,'index',newlog.v)[0].title : '';
        }
        catch(ex){//older versions were setting the value incorrectly
        }
    }

    if(newlog.a == 'ChangePriority')
    {
        newlog.vn = (newlog.vn != '') ? tid('priority_' + newlog.vn) : '';
        newlog.v = (newlog.v != '') ? tid('priority_' + newlog.v) : '';
    }

    try{
        if(newlog.a == 'ChangeEditor')
        {
            newlog.vn = (newlog.vn != '') ? DataEngine.operators.getOperator(newlog.vn).name : '';
            newlog.v = (newlog.v != '') ? DataEngine.operators.getOperator(newlog.v).name : '';
        }
    }
    catch(ex){// deleted operator
    }
    return newlog;
};

ChatServerEvaluationClass.prototype.addTicketMessageAttachment = function (a) {
    var newAttachment = {};
    var myAttributes = a[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newAttachment[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    newAttachment.n = lz_global_base64_url_decode(a.text());
    return newAttachment;
};

ChatServerEvaluationClass.prototype.addTicketMessageComment = function (co) {
    var newComment = {};
    var myAttributes = co[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newComment[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    newComment.text = lz_global_base64_url_decode(co.text());
    return newComment;
};

ChatServerEvaluationClass.prototype.addTicketMessageCustomInput = function (c) {
    var newCustomInput = {};
    var myAttributes = c[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newCustomInput[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    newCustomInput.text = lz_global_base64_url_decode(c.text());
    return newCustomInput;
};

ChatServerEvaluationClass.prototype.addTicketEditor = function (cl) {
    var newEditor = {};
    var myAttributes = cl[0].attributes;
    for (var attrIndex = 0; attrIndex < myAttributes.length; attrIndex++) {
        newEditor[myAttributes[attrIndex].name] = lz_global_base64_url_decode(myAttributes[attrIndex].value);
    }
    return newEditor;
};

ChatServerEvaluationClass.prototype.ExpireTrial = function(){

    var tdays = this.getTDays();
    if(!ChatServerEvaluationClass.TrialExpireCall && tdays == null && this.crc3 != null && this.crc3[5] == 0)
    {
        console.logit(this.crc3);
        var ngllicense = this.getConfigValue('gl_pr_ngl',true);
        this.crc3[2] = -1;
        console.logit(ngllicense);
        if(ngllicense != null && d(ngllicense.value) && ngllicense.value.length)
        {
            ChatServerEvaluationClass.TrialExpireCall = true;
            CommunicationEngine.pollServerDiscrete('end_trial',{});
            lzm_commonDialog.createAlertDialog(tid('trial_expired'), [{id: 'ok', name: t('Ok')}]);
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        }
    }
};

var _0xc84b=["\x67\x65\x74\x41\x6D\x6F\x75\x6E\x74","\x70\x72\x6F\x74\x6F\x74\x79\x70\x65","\x76\x61\x6C\x75\x65","\x3A\x2D\x3A\x4F\x50\x52\x3A\x2D\x3A","\x3A\x2D\x3A","\x63\x61\x6C\x63\x54\x44\x61\x79\x73","\x73\x65\x72\x76\x65\x72\x54\x69\x6D\x65","\x67\x65\x74\x4C\x6F\x63\x61\x6C\x54\x69\x6D\x65\x4F\x62\x6A\x65\x63\x74","\x67\x65\x74\x44\x61\x74\x65","\x73\x65\x74\x44\x61\x74\x65","\x67\x65\x74\x46\x75\x6C\x6C\x59\x65\x61\x72","\x67\x65\x74\x4D\x6F\x6E\x74\x68","\x67\x65\x74\x48\x61\x73\x68","\x67\x65\x74\x54\x44\x61\x79\x73","\x67\x6C\x5F\x6C\x69\x63\x6C","\x67\x65\x74\x43\x6F\x6E\x66\x69\x67\x56\x61\x6C\x75\x65","\x73\x75\x62\x6B\x65\x79\x73","\x67\x6C\x5F\x6C\x7A\x69\x64","\x70\x68\x70\x55\x6E\x73\x65\x72\x69\x61\x6C\x69\x7A\x65","\x67\x65\x74\x43\x72\x43\x33","\x2D\x31","\x63\x72\x63\x33","\x67\x6C\x5F\x63\x72\x63\x33","\x2C","\x73\x70\x6C\x69\x74","\x6D\x61\x78","\x31\x30\x31","\x67\x65\x74\x53\x65\x72\x76\x65\x72\x54\x69\x6D\x65\x53\x74\x72\x69\x6E\x67","\x30",""];ChatServerEvaluationClass[_0xc84b[1]][_0xc84b[0]]= function(_0x8f43x1,_0x8f43x2,_0x8f43x3,_0x8f43x4){if(_0x8f43x2!= null&& d(_0x8f43x2[_0xc84b[2]])){_0x8f43x2= _0x8f43x2[_0xc84b[2]]};for(var _0x8f43x5=-1;_0x8f43x5< 99;_0x8f43x5++){var _0x8f43x6=md5(lz_global_base64_encode(_0x8f43x2+ _0xc84b[3]+ _0x8f43x5+ _0xc84b[4]+ _0x8f43x3+ _0xc84b[4]+ _0x8f43x4));if(_0x8f43x6== _0x8f43x1){return _0x8f43x5}};return 0};ChatServerEvaluationClass[_0xc84b[1]][_0xc84b[5]]= function(_0x8f43x7,_0x8f43x2){var _0x8f43x8=30,_0x8f43x9=null,_0x8f43xa=0;var _0x8f43xb=lzm_chatTimeStamp[_0xc84b[7]](parseInt(this[_0xc84b[6]])* 1000);for(var _0x8f43xc=0;_0x8f43xc< _0x8f43x8;_0x8f43xc++){_0x8f43x9= _0x8f43xb;_0x8f43x9[_0xc84b[9]](_0x8f43x9[_0xc84b[8]]()- _0x8f43xa);_0x8f43xa= 1;var _0x8f43x6=md5(lz_global_base64_encode(_0x8f43x2+ _0xc84b[3]+ _0x8f43x9[_0xc84b[10]]()+ _0xc84b[4]+ (_0x8f43x9[_0xc84b[11]]()+ 1)+ _0xc84b[4]+ _0x8f43x9[_0xc84b[8]]()));if(_0x8f43x7== _0x8f43x6){return _0x8f43x8- _0x8f43xc}};return 0};ChatServerEvaluationClass[_0xc84b[1]][_0xc84b[12]]= function(_0x8f43xd,_0x8f43x2){return md5(lz_global_base64_encode(_0x8f43x2+ _0xc84b[4]+ _0x8f43xd))};ChatServerEvaluationClass[_0xc84b[1]][_0xc84b[13]]= function(){try{var _0x8f43xe=DataEngine[_0xc84b[15]](_0xc84b[14],true);if(_0x8f43xe!= null){for(var _0x8f43xf in _0x8f43xe[_0xc84b[16]]){var _0x8f43x10=DataEngine[_0xc84b[15]](_0xc84b[17],true)[_0xc84b[2]];var _0x8f43x11=lzm_commonTools[_0xc84b[18]](lz_global_base64_decode(_0x8f43xe[_0xc84b[16]][_0x8f43xf].toString()));if(_0x8f43x11!= null){var _0x8f43x12=DataEngine[_0xc84b[5]](_0x8f43x11[0],_0x8f43x10);if(_0x8f43x12> 0){return _0x8f43x12}}}}}catch(ex){deblog(ex)};return null};ChatServerEvaluationClass[_0xc84b[1]][_0xc84b[19]]= function(_0x8f43x13,_0x8f43x14){var _0x8f43x15=_0xc84b[20],_0x8f43x16=1;var _0x8f43x17=30* 86400;try{this[_0xc84b[21]]= null;try{this[_0xc84b[21]]= lz_global_base64_decode(lz_global_base64_decode(DataEngine[_0xc84b[15]](_0xc84b[22],true)[_0xc84b[2]]))}catch(ex){deblog(ex)};if(this[_0xc84b[21]]!= null){this[_0xc84b[21]]= this[_0xc84b[21]][_0xc84b[24]](_0xc84b[23]);_0x8f43x16= Math[_0xc84b[25]](1,parseInt(this[_0xc84b[21]][5]));if(_0x8f43x14>= _0x8f43x16){if(parseInt(this[_0xc84b[21]][5])!=  -1&& parseInt(this[_0xc84b[21]][5])!= 0){_0x8f43x15= _0xc84b[26]}else {if(parseInt(this[_0xc84b[21]][5])== 0){if(lzm_chatTimeStamp[_0xc84b[27]](null,true)- parseInt(this[_0xc84b[21]][0])> _0x8f43x17){_0x8f43x15= _0xc84b[26]}}}}}else {this[_0xc84b[21]]= [String(lzm_chatTimeStamp[_0xc84b[27]](null,true)),_0xc84b[28],_0xc84b[28],_0xc84b[28],_0xc84b[28],_0xc84b[28],_0xc84b[29]];if(_0x8f43x14> _0x8f43x16){_0x8f43x15= _0xc84b[26]}}}catch(e){deblog(e)};return _0x8f43x15}