/****************************************************************************************
 * LiveZilla ChatUserActionsClass.js
 *
 * Copyright 2013 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function ChatUserActionsClass(lzm_commonTools, lzm_chatPollServer, lzm_chatDisplay, lzm_chatServerEvaluation, lzm_commonTranslation, lzm_commonStorage, lzm_chatInputEditor, chosenProfile) {

    this.forwardData = {};
    this.lzm_commonTools = lzm_commonTools;
    this.lzm_chatPollServer = lzm_chatPollServer;
    this.lzm_chatDisplay = lzm_chatDisplay;
    this.lzm_chatServerEvaluation = lzm_chatServerEvaluation;
    this.lzm_commonTranslation = lzm_commonTranslation;
    this.lzm_commonStorage = lzm_commonStorage;
    this.chosenProfile = chosenProfile;
    this.lzm_chatInputEditor = lzm_chatInputEditor;

    this.userLanguage = '';
    this.gTranslateLanguage = '';
    this.acceptedChatCounter = 0;
    this.messageFromKnowledgebase = false;

    this.ChatInputValues = {};
    this.chatCallBackList = [];
}


/**************************************** General functions ****************************************/
ChatUserActionsClass.prototype.resetWebApp = function() {

};

ChatUserActionsClass.prototype.sendChatMessage = function (new_chat, translated_chat, _chatFullId) {

    var chatText = new_chat.text;
    this.lzm_chatPollServer.stopPolling();
    var pPostsVObject = {
        a: chatText,
        b:new_chat.reco,
        c:new_chat.id,
        d: '',
        e: ''
    };

    if(d(new_chat.cid))
        pPostsVObject.f = new_chat.cid;

    if(translated_chat != null && _chatFullId != null)
    {
        if (translated_chat != '' && lzm_chatDisplay.chatTranslations[_chatFullId].tmm.targetLanguage != '')
        {
            pPostsVObject.d = translated_chat;
            pPostsVObject.e = lzm_chatDisplay.chatTranslations[_chatFullId].tmm.targetLanguage.toUpperCase();
        }
    }

    this.messageFromKnowledgebase = false;
    this.lzm_chatPollServer.addToOutboundQueue('p_posts_v', pPostsVObject);
    this.lzm_chatPollServer.pollServer(this.lzm_chatPollServer.fillDataObject(), 'shout');
};

ChatUserActionsClass.prototype.getTranslationLanguages = function(target) {
    var that = this;
    if (DataEngine.otrs != '' && DataEngine.otrs != null) {
        var gUrl = 'https://www.googleapis.com/language/translate/v2/languages';
        try {
            target = (typeof target != 'undefined') ? target : DataEngine.operators.getOperator(lzm_chatDisplay.myId).lang.toLowerCase();
        } catch(ex) {
            target = 'en';
        }
        var dataObject = {key: DataEngine.otrs, target: target};
        $.ajax({
            type: "GET",
            url: gUrl,
            data: dataObject,
            success: function (data) {
                that.gTranslateLanguage = target;
                lzm_chatDisplay.translationLanguages = lzm_commonTools.clone(data.data.languages);
                lzm_chatDisplay.translationLangCodes = [];
                for (var i=0; i<data.data.languages.length; i++) {
                    lzm_chatDisplay.translationLangCodes.push(data.data.languages[i].language);
                }
                lzm_chatDisplay.translationServiceError = null;
            },
            error: function (jqXHR, textStatus, errorThrown) {
                if (target.indexOf('-') != -1) {
                    target = target.split('-')[0];
                    that.getTranslationLanguages(target);
                } else if (target != 'en') {
                    that.getTranslationLanguages('en');
                } else {
                    lzm_chatDisplay.translationServiceError = 'Google API Failure'
                }
            },
            dataType: 'json'
        });
    }
};

ChatUserActionsClass.prototype.saveTranslationSettings = function(visitorChat, tmm, tvm) {
    var visitor = visitorChat.split('~');
    var myObject = {visitorId: visitor[0], browserId: visitor[1], chatId: visitor[2], sourceLanguage: '', targetLanguage: ''};
    if (typeof lzm_chatDisplay.chatTranslations[visitorChat] == 'undefined')
        lzm_chatDisplay.chatTranslations[visitorChat] = {tmm: null, tvm: null};

    var translate = tmm.translate && (tmm.sourceLanguage != tmm.targetLanguage);
    lzm_chatDisplay.chatTranslations[visitorChat].tmm = {translate: translate, sourceLanguage: tmm.sourceLanguage,targetLanguage: tmm.targetLanguage};
    translate = tvm.translate && (tvm.sourceLanguage != tvm.targetLanguage);

    lzm_chatDisplay.chatTranslations[visitorChat].tvm = {translate: translate, sourceLanguage: tvm.sourceLanguage,targetLanguage: tvm.targetLanguage};
    if (tvm.translate)
    {
        myObject.sourceLanguage = tvm.sourceLanguage;
        myObject.targetLanguage = tvm.targetLanguage;
    }
    CommunicationEngine.pollServerSpecial(myObject, 'set-translation');

    /*
    if ((tmm.translate && tmm.sourceLanguage != tmm.targetLanguage) || (tvm.translate && tvm.sourceLanguage != tvm.targetLanguage)) {
        $('#translate-chat').addClass('lzm-button-b-active');
    } else {
        $('#translate-chat').removeClass('lzm-button-b-active');
    }
    */

    lzm_chatDisplay.updateTranslateButtonUI(visitorChat);
};

ChatUserActionsClass.prototype.TranslateTextAndSend = function(_chatFullId, chatMessage, chatReco) {
    var gUrl = 'https://www.googleapis.com/language/translate/v2';
    var dataObject = {key: DataEngine.otrs, source: lzm_chatDisplay.chatTranslations[_chatFullId].tmm.sourceLanguage,
        target: lzm_chatDisplay.chatTranslations[_chatFullId].tmm.targetLanguage, q: chatMessage};
    $.ajax({
        type: "GET",
        url: gUrl,
        data: dataObject,
        success: function (data) {
            var translatedChatMessage = data.data.translations[0].translatedText;
            SendChat(chatMessage, chatReco, translatedChatMessage);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            SendChat(chatMessage, chatReco, '');
        },
        dataType: 'json'
    });
};

ChatUserActionsClass.prototype.removeForwardFromList = function (id, b_id) {
    var tmp_external_forwards = [];
    //var tmp_extForwardIdList = [];
    var removeExternalForwardId = [];
    for (var extFwdIndex = 0; extFwdIndex < this.lzm_chatServerEvaluation.external_forwards.length; extFwdIndex++) {
        if (this.lzm_chatServerEvaluation.external_forwards[extFwdIndex].u != id + '~' + b_id) {
            tmp_external_forwards.push(this.lzm_chatServerEvaluation.external_forwards[extFwdIndex]);
        } else {
            removeExternalForwardId.push(this.lzm_chatServerEvaluation.external_forwards[extFwdIndex].id);
        }
    }
    /*for (var extFwdIdIndex = 0; extFwdIdIndex < this.DataEngine.extForwardIdList.length; extFwdIdIndex++) {
        if ($.inArray(this.DataEngine.extForwardIdList[extFwdIdIndex], removeExternalForwardId) == -1) {
            tmp_extForwardIdList.push(this.DataEngine.extForwardIdList[extFwdIdIndex]);
        }
    }*/
    this.lzm_chatServerEvaluation.external_forwards = tmp_external_forwards;
    //this.DataEngine.extForwardIdList = tmp_extForwardIdList;
};

ChatUserActionsClass.prototype.saveUserSettings = function (settings) {

    // DONT ADD HERE ADD IN chat.js

    this.chosenProfile.user_volume = settings.volume;
    this.lzm_chatDisplay.volume = settings.volume;
    this.chosenProfile.user_away_after = settings.awayAfterTime;
    this.lzm_chatDisplay.awayAfterTime = settings.awayAfterTime;



    this.chosenProfile.background_mode = settings.backgroundMode;
    this.lzm_chatDisplay.backgroundModeChecked = settings.backgroundMode;
    this.chosenProfile.save_connections = settings.saveConnections;
    this.lzm_chatDisplay.saveConnections = settings.saveConnections;
    this.chosenProfile.tickets_read = settings.ticketsRead;
    this.lzm_chatDisplay.ticketReadStatusChecked = settings.ticketsRead;


    this.chosenProfile.vibrate_notifications = settings.vibrateNotifications;
    lzm_chatDisplay.vibrateNotifications = settings.vibrateNotifications;
    this.chosenProfile.show_view_select_panel = JSON.stringify(settings.showViewSelectPanel);
    lzm_chatDisplay.showViewSelectPanel = settings.showViewSelectPanel;

    // DONT ADD HERE ADD IN chat.js

    this.chosenProfile.qrd_auto_search = settings.qrdAutoSearch;
    lzm_chatDisplay.qrdAutoSearch = settings.qrdAutoSearch;
    this.chosenProfile.alert_new_filter = settings.alertNewFilter;
    lzm_chatDisplay.alertNewFilter = settings.alertNewFilter;

    if(settings.tableColumns != null)
    {
        var tableNames = lzm_chatDisplay.settingsDisplay.tableIds,i;
        for (i=0; i<tableNames.length; i++)
        {
            var tableColumns = {}, j = 0;

            for (j=0; j<settings.tableColumns[tableNames[i]].general.length; j++)
                tableColumns[settings.tableColumns[tableNames[i]].general[j].cid.toString()] = settings.tableColumns[tableNames[i]].general[j].display;

            lzm_commonStorage.saveValue(tableNames[i] + '_column_tbl_' + DataEngine.myId, JSON.stringify(tableColumns));
            LocalConfiguration.CreateTableArray(tableNames[i], 'general', tableColumns);

            //tableColumns = {};
            //for (j=0; j<settings.tableColumns[tableNames[i]].custom.length; j++)
              //  tableColumns[settings.tableColumns[tableNames[i]].custom[j].cid] = settings.tableColumns[tableNames[i]].custom[j].display;
            //lzm_commonStorage.saveValue('custom_' + tableNames[i] + '_column_tbl_' + DataEngine.myId, JSON.stringify(tableColumns));
            //LocalConfiguration.CreateTableArray(tableNames[i], 'custom', tableColumns);


        }
    }

    // DONT ADD HERE ADD IN chat.js

    LocalConfiguration.ShowViewSelectPanel = settings.showViewSelectPanel;
    LocalConfiguration.ViewSelectArray = settings.viewSelectArray;

    lzm_commonStorage.saveValue('save_connections_' + DataEngine.myId, JSON.stringify(settings.saveConnections));
    lzm_commonStorage.saveValue('vibrate_notifications_' + DataEngine.myId, JSON.stringify(settings.vibrateNotifications));
    lzm_commonStorage.saveValue('tickets_read_' + DataEngine.myId, JSON.stringify(settings.ticketsRead));
    lzm_commonStorage.saveValue('qrd_auto_search_' + DataEngine.myId, JSON.stringify(settings.qrdAutoSearch));
    lzm_commonStorage.saveValue('alert_new_filter_' + DataEngine.myId, JSON.stringify(settings.alertNewFilter));

    IFManager.IFSetVibrateOnNotifications(settings.vibrateNotifications);


    // DONT ADD HERE ADD IN chat.js

    this.lzm_commonStorage.loadProfileData();
    var tmpProfile = this.lzm_commonTools.clone(this.chosenProfile);
    if (this.chosenProfile.server_url.indexOf(':') != -1) {
        var tmpUrlArray = this.chosenProfile.server_url.split(':');
        var tmpUrl = tmpUrlArray[0];
        tmpUrlArray = tmpUrlArray[1].split('/');
        for (i=1; i< tmpUrlArray.length; i++)
        {
            tmpUrl += '/' + tmpUrlArray[i];
        }
        tmpProfile.server_url = tmpUrl;
    }
    tmpProfile.keepPassword = true;
    var savedIndex = this.lzm_commonStorage.saveProfile(tmpProfile);

    IFManager.IFKeepActiveInBackgroundMode(settings.backgroundMode == 1);

    LocalConfiguration.Save();

    // DONT ADD HERE ADD IN chat.js

};

ChatUserActionsClass.prototype.replaceLinks = function(myText) {
    var links = myText.match(/href="#" onclick="openLink\('.*?'\)"/);
    if (typeof links != 'undefined' && links != null) {
        for (var i=0; i<links.length; i++) {
            var address = links[i].replace(/href="#" onclick="openLink\('/,'').replace(/'\)"/,'');
            var replacement = 'href="' + address + '" target="_blank"';
            myText = myText.replace(links[i],replacement);
        }
    }
    return myText;
};

ChatUserActionsClass.prototype.chatInternalWith = function (id, userid, name, fromOpList) {
    var thisClass = this;

    thisClass.saveChatInput(ChatManager.ActiveChat);
    this.lzm_chatDisplay.selected_view = 'mychats';

    var group = DataEngine.groups.getGroup(id);
    DataEngine.ChatManager.AddInternalChat(id,(group != null || id == 'everyoneintern') ? Chat.ChatGroup : Chat.Operator);
    DataEngine.ChatManager.SetActiveChat(id);

    var loadedValue = thisClass.loadChatInput(ChatManager.ActiveChat);

    this.lzm_chatDisplay.toggleVisibility();
    this.lzm_chatDisplay.createViewSelectPanel(this.lzm_chatDisplay.firstVisibleView);

    initEditor(loadedValue, 'chatInternalWith', id);

    this.lzm_chatDisplay.createChatWindowLayout(true);
    this.lzm_chatDisplay.DrawInternalChat();


    $('#send-qrd').click(function() {
        showQrd(id, 'chat');
    });
    this.lzm_chatDisplay.removeSoundPlayed(id);

};

ChatUserActionsClass.prototype.leaveInternalChat = function(id, userid, name, openNext) {

    this.deleteChatInput(ChatManager.ActiveChat);

};

ChatUserActionsClass.prototype.SaveChatGroup = function(action, groupId, groupName, memberId, additionalData) {
    var dynamicGroupObject = {}, pollType = '', memberUserId = '', memberBrowserId = '', memberChatId = '',
        memberIsPersistent = 1, newGroupId, i = 0;
    var group = DataEngine.groups.getGroup(groupId);
    var operator = DataEngine.operators.getOperator(memberId);
    var visitor = VisitorManager.GetVisitor(memberId);

    if (operator != null)
    {
        memberUserId = operator.userid;
    }
    if (visitor != null) {
        memberUserId = visitor.id;
        memberBrowserId = additionalData.browserId;
        memberChatId = additionalData.chatId;
        memberIsPersistent = (additionalData.isPersistent) ? '1' : '0';
        memberId = memberId + '~' + memberBrowserId;
    }
    switch (action) {
        case 'create':
            newGroupId = md5('' + Math.random());
            dynamicGroupObject.myUserId = DataEngine.myUserId;
            dynamicGroupObject.myId = DataEngine.myId;
            dynamicGroupObject.groupId = newGroupId;
            dynamicGroupObject.groupName = groupName;
            pollType = 'dynamic-group-create';
            break;
        case 'delete':
            dynamicGroupObject.myUserId = DataEngine.myUserId;
            dynamicGroupObject.myId = DataEngine.myId;
            dynamicGroupObject.groupId = groupId;
            pollType = 'dynamic-group-delete';
            break;
        case 'create-add':
            newGroupId = md5('' + Math.random());
            dynamicGroupObject.myUserId = DataEngine.myUserId;
            dynamicGroupObject.myId = DataEngine.myId;
            dynamicGroupObject.groupId = newGroupId;
            dynamicGroupObject.groupName = groupName;
            dynamicGroupObject.operatorUserId = memberUserId;
            dynamicGroupObject.operatorId = memberId;
            dynamicGroupObject.isPersistent = memberIsPersistent;
            dynamicGroupObject.browserId = memberBrowserId;
            dynamicGroupObject.chatId = memberChatId;
            pollType = 'dynamic-group-create-add';
            break;
        case 'add':
            dynamicGroupObject.groupId = groupId;
            dynamicGroupObject.operatorUserId = memberUserId;
            dynamicGroupObject.browserId = memberBrowserId;
            dynamicGroupObject.chatId = memberChatId;
            dynamicGroupObject.operatorId = memberId;
            dynamicGroupObject.isPersistent = memberIsPersistent;
            pollType = 'dynamic-group-add';
            break;
        case 'remove':
            dynamicGroupObject.groupId = groupId;
            dynamicGroupObject.operatorUserId = memberUserId;
            dynamicGroupObject.operatorId = memberId;
            pollType = 'dynamic-group-remove';
            break;
    }
    CommunicationEngine.pollServerSpecial(dynamicGroupObject, pollType);
    lzm_chatDisplay.createOperatorList();
};

ChatUserActionsClass.prototype.inviteExternalUser = function (id, b_id, text) {
    CommunicationEngine.stopPolling();
    CommunicationEngine.addToOutboundQueue('p_requests_va', id, 'nonumber');
    CommunicationEngine.addToOutboundQueue('p_requests_vb', b_id, 'nonumber');
    CommunicationEngine.addToOutboundQueue('p_requests_vc', DataEngine.myName, 'nonumber');
    CommunicationEngine.addToOutboundQueue('p_requests_vd', DataEngine.myUserId, 'nonumber');
    CommunicationEngine.addToOutboundQueue('p_requests_ve', lz_global_base64_encode(text), 'nonumber');
    CommunicationEngine.addToOutboundQueue('p_requests_vf', DataEngine.myGroup, 'nonumber');
    CommunicationEngine.pollServer(CommunicationEngine.fillDataObject(), 'shout');
};

ChatUserActionsClass.prototype.cancelInvitation = function(id) {
    this.lzm_chatPollServer.stopPolling();
    this.lzm_chatPollServer.addToOutboundQueue('p_cncl_inv', id, 'nonumber');
    this.lzm_chatPollServer.pollServer(this.lzm_chatPollServer.fillDataObject(), 'shout');
};

ChatUserActionsClass.prototype.getChatPM = function(_chatObj, visitorId, browserId, pmId, language, groupId) {

    var visitor=null,j,chatGroup = '', visitorName = '', visitorEmail = '', visitorCompany = '', visitorPhone = '';
    var visitorIp = '', visitorQuestion = '', visitorChatId = '', visitorUrl = '', visitorPageTitle = '';
    var visitorSearchString = '';
    var pm = {}, fallbackPm = {}, fallbackPm2 = {}, pm2 = {}, pm3 = {};
    var chatLang = DataEngine.defaultLanguage.toUpperCase();
    var chatLangShort = chatLang.substr(0,2);

    if(_chatObj != null)
    {
        chatGroup = _chatObj.dcg;
        visitorQuestion = lzm_commonTools.htmlEntities(_chatObj.s);
        visitorChatId = _chatObj.i;
    }

    if(_chatObj != null && _chatObj.Visitor != null)
        visitor = _chatObj.Visitor;
    else
        visitor = VisitorManager.GetVisitor(visitorId);

    if(visitor != null)
    {
        visitorName = DataEngine.inputList.getInputValueFromVisitor(111,visitor);
        visitorEmail = DataEngine.inputList.getInputValueFromVisitor(112,visitor);
        visitorCompany = DataEngine.inputList.getInputValueFromVisitor(113,visitor);
        visitorPhone = DataEngine.inputList.getInputValueFromVisitor(116,visitor);

        for (j=0; j<visitor.b.length; j++)
        {
            if (browserId != null && browserId.indexOf('_OVL') == -1 && d(visitor.b[j].h2))
            {
                var hLast = visitor.b[j].h2.length - 1;
                if (typeof visitor.b[j].h2[hLast].url != 'undefined')
                {
                    visitorUrl = visitor.b[j].h2[hLast].url;
                }
                if (typeof visitor.b[j].h2[hLast].title != 'undefined')
                {
                    visitorPageTitle = visitor.b[j].h2[hLast].title;
                }
                if (typeof visitor.b[j].ss != 'undefined')
                {
                    visitorSearchString = visitor.b[j].ss;
                }
                break;
            }
        }

        if (d(visitor.lang) && visitor.lang != '')
        {
            chatLang = visitor.lang;
        }
        if (d(visitor.ip))
        {
            visitorIp = visitor.ip;
        }
    }

    var pmLanguages = this.getPmLanguages(chatGroup);
    var globalDefaultLanguage = pmLanguages['default'][1];
    if (typeof language != 'undefined' && language != '')
    {
        chatLang = language;
        chatLangShort = language.substr(0,2);
    }

    if (d(groupId) || chatGroup!='')
    {
        groupId = (typeof groupId != 'undefined' && groupId != '') ? groupId : chatGroup;
        var group = DataEngine.groups.getGroup(groupId);
        if (group != null)
        {
            for (j=0; j<group.pm.length; j++)
            {
                if (chatLang == group.pm[j].lang)
                {
                    pm = lzm_commonTools.clone(group.pm[j]);
                }
                if (chatLangShort == group.pm[j].lang)
                {
                    pm2 = lzm_commonTools.clone(group.pm[j]);
                }
                if (chatLangShort == group.pm[j].shortlang)
                {
                    pm3 = lzm_commonTools.clone(group.pm[j]);
                }
                if (globalDefaultLanguage == group.pm[j].lang)
                {
                    fallbackPm = lzm_commonTools.clone(group.pm[j]);
                }
                if (globalDefaultLanguage == group.pm[j].shortlang)
                {
                    fallbackPm2 = lzm_commonTools.clone(group.pm[j]);
                }
            }
        }
    }

    pm = (typeof pm[pmId] != 'undefined' && pm[pmId] != '') ? pm : (typeof pm2[pmId] != 'undefined' && pm2[pmId] != '') ? pm2 : pm3;
    pm = (typeof pm[pmId] != 'undefined' && pm[pmId] != '') ? pm : fallbackPm;

    var nameParts = visitorName.split(' ');
    var visitorFirstName = (nameParts.length > 0) ? nameParts.shift() : '';
    var visitorLastName = (nameParts.length > 0) ? nameParts.join(' ') : '';
    var visitorNameWithBlank = (visitorName != '') ? ' ' + visitorName : '';
    if (typeof pm[pmId] != 'undefined') {
        pm[pmId] = pm[pmId].replace(/ %external_name%/, visitorNameWithBlank)
            .replace(/%external_name%/, visitorName)
            .replace(/%external_firstname%/, visitorFirstName)
            .replace(/%external_lastname%/, visitorLastName)
            .replace(/%question%/, visitorQuestion)
            .replace(/%external_ip%/, visitorIp)
            .replace(/%chat_id%/, visitorChatId)
            .replace(/%searchstring%/, visitorSearchString)
			.replace(/%domain%/, '')
            .replace(/%url%/, visitorUrl)
            .replace(/%page_title%/, visitorPageTitle)
            .replace(/%external_email%/, visitorEmail)
            .replace(/%external_phone%/, visitorPhone)
            .replace(/%external_company%/, visitorCompany)
            .replace(/%name%/, this.lzm_chatServerEvaluation.myName)
            .replace(/%operator_name%/, this.lzm_chatServerEvaluation.myName);
    }
    else
    {
        pm[pmId] = '';
    }
    return pm;
};

ChatUserActionsClass.prototype.getPmLanguages = function(groupId) {
    var pmLanguages = {group: [], user:[], all: [], default: []};
    var i, j;
    var group = (groupId != '') ? DataEngine.groups.getGroup(groupId) : DataEngine.groups.getGroupList()[0];
    if (group != null) {
        for (j=0; j<group.pm.length; j++) {
            pmLanguages.group.push(group.pm[j].lang);
            pmLanguages.all.push(group.pm[j].lang);
            if (group.pm[j].def == '1') {
                pmLanguages.default = ['group', group.pm[j].lang];
            }
        }
    }
    var operator = DataEngine.operators.getOperator(DataEngine.myId);
    if (operator != null) {
        try {
            for (j=0; j<operator.pm.length; j++) {
                if ($.inArray(operator.pm[j].lang, pmLanguages) == -1) {
                    pmLanguages.user.push(operator.pm[j].lang);
                    pmLanguages.all.push(operator.pm[j].lang);
                    if (operator.pm[j].def == '1') {
                        pmLanguages.default = ['user', operator.pm[j].lang];
                    }
                }
            }
        } catch(ex) {}
    }
    return pmLanguages;
};

ChatUserActionsClass.prototype.saveChatInput = function(acchat, text) {
    if (typeof acchat != 'undefined' && acchat != '' && acchat != 'LIST')
    {
        var chatInput = '';
        if (typeof text != 'undefined' && text != '' && text != null)
        {
            chatInput = text;
        }
        else if (typeof text != 'undefined' && text == null)
        {
            chatInput = null;
        }
        else
        {
            var tmpInput = grabEditorContents();
            chatInput = tmpInput.replace(/^ */,'').replace(/ *$/,'');
        }
        if (chatInput == null)
        {
            this.ChatInputValues[acchat] = '';
        }
        else if (chatInput != '') {
            this.ChatInputValues[acchat] = chatInput;
        }
        else
        {
            // temp, could be risky
            //this.ChatInputValues[acchat] = '';
        }
    }
};

ChatUserActionsClass.prototype.loadChatInput = function(active_chat_reco) {
    var rtValue = '';
    if (typeof active_chat_reco != 'undefined' && active_chat_reco != '' && typeof this.ChatInputValues[active_chat_reco] != 'undefined') {
        rtValue = this.ChatInputValues[active_chat_reco];
    }
    return rtValue;
};

ChatUserActionsClass.prototype.deleteChatInput = function(active_chat_reco) {
    if (typeof active_chat_reco != 'undefined' && active_chat_reco != '' && typeof this.ChatInputValues[active_chat_reco] != 'undefined')
    {
        delete this.ChatInputValues[active_chat_reco];
    }
};

ChatUserActionsClass.prototype.showVisitorChat = function (id, b_id, chat_id, freeToChat, newlyAcceptedChat) {
    var thisClass = this;
    this.saveChatInput(ChatManager.ActiveChat);
    this.lzm_chatDisplay.selected_view = 'mychats';
    DataEngine.ChatManager.SetActiveChat(id+ '~' + b_id);

    thisClass.lzm_chatDisplay.toggleVisibility();
    thisClass.lzm_chatDisplay.createViewSelectPanel(thisClass.lzm_chatDisplay.firstVisibleView);
    var chat = DataEngine.ChatManager.GetChat();

    if (chat.GetStatus() == Chat.Active && chat.IsMember(DataEngine.myId))
    {
        thisClass.lzm_chatDisplay.DrawActiveVisitorChat();
        var loadedValue = thisClass.loadChatInput(ChatManager.ActiveChat);
        initEditor(loadedValue, 'viewUserData');
        thisClass.chatExternalWith(chat.v, chat.b, chat.i, 0);
        thisClass.lzm_chatDisplay.removeSoundPlayed(chat.SystemId);
    }
    else
    {
        removeEditor();
        thisClass.lzm_chatDisplay.DrawPassiveVisitorChat();
        $('#accept-chat').click(function () {
            thisClass.AcceptChat(chat,true);
            thisClass.showVisitorChat(id, b_id, chat_id, freeToChat, true);
            var vb = chat.Browser;
            if (vb[1] != null && vb[1].chat.id != '' && vb[1].chat.cmb == 1 && vb[1].cphone != '' && $.inArray(id + '~' + b_id, thisClass.chatCallBackList) == -1)
            {
                showPhoneCallDialog(id + '~' + b_id, -1, 'chat');
            }
        });
        $('#decline-chat').click(function () {
            thisClass.declineChat(id, b_id, chat_id);
        });
        $('#forward-chat').click(function () {

            forwardChat(chat_id,'forward');


            if (lzm_commonPermissions.checkUserPermissions('', 'chats', 'forward', {})) {
                var storedForwardId = '';
                for (var key in thisClass.lzm_chatDisplay.StoredDialogs) {
                    if (thisClass.lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                        if (thisClass.lzm_chatDisplay.StoredDialogs[key].type == 'operator-invitation' &&
                            typeof thisClass.lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] != 'undefined' &&
                            thisClass.lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] == id + '~' + b_id) {
                            storedForwardId = key;
                        }
                    }
                }
                if (storedForwardId != '')
                    lzm_displayHelper.maximizeDialogWindow(storedForwardId);
                else if(thisClass.lzm_chatDisplay.ChatForwardInvite != null)
                    thisClass.lzm_chatDisplay.ChatForwardInvite.createOperatorForwardInviteHtml('forward', CommunicationEngine.thisUser, id, b_id, chat_id);

            } else
                showNoPermissionMessage();


        });

    }
    lzm_chatDisplay.createChatWindowLayout(true);
    lzm_chatDisplay.DrawChat();
};

ChatUserActionsClass.prototype.declineChat = function(id, b_id, chat_id){
    if (lzm_commonPermissions.checkUserPermissions('', 'chats', 'decline', {}))
    {
        //this.removeForwardFromList(id, b_id);

        this.lzm_chatPollServer.stopPolling();
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_va', id, 'nonumber');
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vb', b_id, 'nonumber');
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vc', chat_id, 'nonumber');
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vd', 'DeclineChat', 'nonumber');
        this.lzm_chatPollServer.pollServer(this.lzm_chatPollServer.fillDataObject(), 'shout');
        this.lzm_chatDisplay.removeSoundPlayed(id + '~' + b_id);

        //this.showVisitorChat(id, b_id, chat_id);
    }
    else
    {
        showNoPermissionMessage();
    }
};

ChatUserActionsClass.prototype.AcceptChat = function(_chatObj, _showSalutation) {

    var thisClass = this;
    if (_chatObj != null)
    {
        _chatObj.IsUnread = false;

        CommunicationEngine.pollServerSpecial(_chatObj, 'accept-chat');

        _chatObj.AcceptInitiated = true;

        setTimeout(function(){
            $('#accept-chat').addClass('ui-disabled');
        },200);
        setTimeout(function(){

            if(_chatObj != null)
            {
                _chatObj.AcceptInitiated = false;
                if(ChatManager.ActiveChat == _chatObj.SystemId && _chatObj.GetStatus() != Chat.Closed)
                    $('#accept-chat').removeClass('ui-disabled');
            }
        },10000);

        var pm = null, pmId = 'wel';
        try
        {
            if (_chatObj.cmb == '1' && DataEngine.inputList.getInputValueFromVisitor(116,_chatObj.Visitor) != '')
            {
                pmId = 'welcmb';
            }
            else
            {
                pmId = 'wel';
            }
        }
        catch(ex)
        {
            deblog(ex);
        }

        try
        {
            pm = this.getChatPM(_chatObj, _chatObj.v, _chatObj.b, pmId, _chatObj.Visitor.lang);
        }
        catch(ex)
        {
            deblog(ex);
        }

        if (pm != null && typeof pm.aw != 'undefined' && pm.aw == 1 && _showSalutation)
        {
            var pmMessage = pm[pmId];
            if (typeof pm.edit != 'undefined' && pm.edit == 0)
            {
                _chatObj.AutoAcceptMessage = pmMessage;
            }
            else
            {
                thisClass.ChatInputValues[_chatObj.v + '~' + _chatObj.b] = pmMessage;
            }
        }
    }
};

ChatUserActionsClass.prototype.chatExternalWith = function (id, b_id, chat_id) {
    var thisClass = this;
    thisClass.removeForwardFromList(id, b_id);

    $('#chat-action').css('display', 'block');
    $('#chat-progress').css('display', 'block');
    $('#chat-qrd-preview').css('display', 'block');

    var chat = DataEngine.ChatManager.GetChat(chat_id,'i');
    var thisInviteOperator = $('#invite-operator');
    var thisForwardChat = $('#forward-chat');

    thisInviteOperator.click(function () {
        thisClass.lzm_chatDisplay.ChatForwardInvite.createOperatorForwardInviteHtml('invite', CommunicationEngine.thisUser, id, b_id, chat_id);
    });
    thisForwardChat.click(function () {
        if (lzm_commonPermissions.checkUserPermissions('', 'chats', 'forward', {})) {
            var storedForwardId = '';
            for (var key in thisClass.lzm_chatDisplay.StoredDialogs) {
                if (thisClass.lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                    if (thisClass.lzm_chatDisplay.StoredDialogs[key].type == 'operator-invitation' &&
                        typeof thisClass.lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] != 'undefined' &&
                        thisClass.lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] == id + '~' + b_id) {
                        storedForwardId = key;
                    }
                }
            }
            if (storedForwardId != '') {
                lzm_displayHelper.maximizeDialogWindow(storedForwardId);
            } else {
                thisClass.lzm_chatDisplay.ChatForwardInvite.createOperatorForwardInviteHtml('forward', CommunicationEngine.thisUser, id, b_id, chat_id);
            }
        } else {
            showNoPermissionMessage();
        }
    });

    $('#add-visitor-to-dynamic-group').click(function () {
        if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'group', '', {o: lzm_chatDisplay.myId}))
            addToChatGroup(id, b_id, chat_id);
        else
            showNoPermissionMessage();

    });
    $('#send-qrd').click(function() {
        showQrd(id + '~' + b_id, 'chat');
    });
};

ChatUserActionsClass.prototype.leaveExternalChat = function (id, b_id, chat_id, chat_no, closeOrLeave) {

    this.deleteChatInput(id + '~' + b_id);
    this.removeForwardFromList(id, b_id);
    var chatObj = DataEngine.ChatManager.GetChat(chat_id,'i');
    if (chatObj.GetMember(DataEngine.myId)!=null)
    {
        this.lzm_chatPollServer.stopPolling();
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_va', id, 'nonumber');
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vb', b_id, 'nonumber');
        this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vc', chat_id, 'nonumber');
        if (closeOrLeave == 'close')
            this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vd', 'CloseChat', 'nonumber');
        else
            this.lzm_chatPollServer.addToOutboundQueue('p_ca_0_vd', 'LeaveChat', 'nonumber');
        this.lzm_chatPollServer.pollServer(this.lzm_chatPollServer.fillDataObject(), 'shout');
    }
    clearEditorContents();
};

ChatUserActionsClass.prototype.forwardChat = function (_chatObj, _type) {

    var new_chat;
    if (typeof this.forwardData.id != 'undefined')
    {
        this.deleteChatInput(ChatManager.ActiveChat);
        if (_type == 'forward')
        {
            CommunicationEngine.pollServerSpecial({v: _chatObj.v, b: _chatObj.b, c: _chatObj.i, g: this.forwardData.forward_group, takeover: true,o: this.forwardData.forward_id, a:0}, 'take-chat');
            var extUserName = _chatObj.GetName();
            new_chat = {};
            new_chat.id = md5(String(Math.random())).substr(0, 32);
            new_chat.rp = '';
            new_chat.sen = '0000000';
            new_chat.rec = '';
            new_chat.reco = ChatManager.ActiveChat;
            var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
            new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
            new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', this.userLanguage);
            new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', this.userLanguage);
            new_chat.text = tid('fwd3',[['<!--visitor_name-->','<b>'+extUserName+'</b>'],['<!--op_name-->','<b>'+this.forwardData.forward_name+'</b>']]);
            _chatObj.AddMessage(new_chat);

            if(this.forwardData.forward_text.length)
            {
                new_chat = {};
                new_chat.id = md5(String(Math.random())).substr(0, 32);
                new_chat.rp = '';
                new_chat.sen = DataEngine.myId;
                new_chat.rec = '';
                new_chat.cid = _chatObj.i;
                new_chat.reco = this.forwardData.forward_id;
                new_chat.text = this.forwardData.forward_text + '[__[forward_info:'+_chatObj.i+']__]';
                this.sendChatMessage(new_chat,null,null);
            }
        }
        else if(_type == 'invite')
        {
            new_chat = {};
            new_chat.id = md5(String(Math.random())).substr(0, 32);
            new_chat.rp = '';
            new_chat.sen = DataEngine.myId;
            new_chat.rec = '';
            new_chat.reco = this.forwardData.forward_id;
            new_chat.text = this.forwardData.forward_text + '[__[invite_info:'+_chatObj.i+']__]';
            this.sendChatMessage(new_chat,null,null);
        }
    }
};

ChatUserActionsClass.prototype.selectOperatorForForwarding = function (_chatObj, forward_id, forward_name, forward_group, forward_text, chat_no) {
    this.forwardData = {id:_chatObj.v,
        b_id:_chatObj.b,
        chat_id:_chatObj.i,
        forward_id:forward_id,
        forward_name:forward_name,
        forward_group:forward_group,
        forward_text:forward_text,
        chat_no:chat_no};
};

ChatUserActionsClass.prototype.saveVisitorComment = function(visitorId, commentText) {
    commentText = commentText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '\r\n');
    CommunicationEngine.pollServerSpecial({id: visitorId, t: commentText}, 'visitor-comment');
};

ChatUserActionsClass.prototype.editQrd = function(myResource, ticketId, inDialog) {
    inDialog = (typeof inDialog != 'undefined') ? inDialog : false;
    var thisClass = this;
    var resource = {};
    if (typeof myResource != 'undefined' && myResource != false)
        resource = myResource
    else
        resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);

    if (resource != null) {
        var newRid = resource.rid;
        var newPid = resource.pid;
        var newRank = resource.ra;
        newType = resource.ty;
        var newTitle, newType, newText, newSize, newTags;
        thisClass.lzm_chatDisplay.resourcesDisplay.editQrd(resource, ticketId, inDialog);

        var editResource = $('.qrd-edit-resource');
        var editHtmlResource = $('.qrd-edit-html-resource');
        var editLinkResource = $('.qrd-edit-link-resource');

        switch(parseInt(newType)) {

            case 0:
                editResource.css('display', 'none');
                editHtmlResource.css('display', 'block');
                qrdTextEditor = new ChatEditorClass('qrd-edit-text', false, false, false);
                qrdTextEditor.init(resource.text, 'editQrd');
                UIRenderer.resizeEditResources();
                setTimeout(function(){
                    $('#qrd-edit-title').select();
                    $('#qrd-edit-title').focus();
                },25);
                $("#qrd-edit-text-div label[for='qrd-edit-text']").html(tidc('description'));
                break;
            case 1: // HTML resource
                editResource.css('display', 'none');
                editHtmlResource.css('display', 'block');
                qrdTextEditor = new ChatEditorClass('qrd-edit-text', false, false, false);
                qrdTextEditor.init(resource.text, 'editQrd');
                UIRenderer.resizeEditResources();
                break;
            case 2: // URL
                editResource.css('display', 'none');
                editLinkResource.css('display', 'block');
                break;
        }
        UIRenderer.resizeEditResources();
    }

    $('#edited-qrd-settings').click(function() {
        var editorText = (newType == 1) ? qrdTextEditor.grabHtml() : '';
        showQrdSettings('', 'edit-resource', editorText);
    });
    $('#save-edited-qrd').click(function() {
        var editTitle = $('#qrd-edit-title').val();
        var editTags = $('#edit-resource').data('tags');
        newTitle = editTitle;

        switch (parseInt(newType)) {
            case 0:
                newText = qrdTextEditor.grabHtml();
                delete qrdTextEditor;
                newSize = newText.length + newTitle.length;
                newTags = '';
                break;
            case 1:
                newText = qrdTextEditor.grabHtml();
                delete qrdTextEditor;
                newSize = newText.length + newTitle.length;
                newTags = editTags;
                break;
            case 2:
                newText = $('#qrd-edit-url').val();
                newSize = newText.length + newTitle.length;
                newTags = editTags;
                break;
        }

        var isPublic = $('#edit-resource').data('is_public');
        var fullTextSearch = $('#edit-resource').data('full_text_search');
        var shortcutWord = $('#edit-resource').data('shorcut_word');
        var allowBotAccess = $('#edit-resource').data('allow_bot');
        var languages = $('#edit-resource').data('languages');
        var ownerOPId = $('#edit-resource').data('oid');
        var ownerGRId = $('#edit-resource').data('g');

        if (inDialog)
        {
            lzm_displayHelper.removeDialogWindow('qrd-tree-dialog');
            var dialogContainerHtml = '<div id="qrd-tree-dialog-container" class="dialog-window-container"></div>';
            $('#chat_page').append(dialogContainerHtml).trigger('create');
            $('#qrd-tree-dialog-container').css(thisClass.lzm_chatDisplay.dialogWindowContainerCss);
            $('#qrd-tree-dialog-container').replaceWith(lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId]);
            delete lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId];
            cancelQrd(ticketId);
        }
        else
        {
            lzm_displayHelper.removeDialogWindow('qrd-edit');
        }

        if(!d(shortcutWord))
        {
            shortcutWord = '';
            deblog("Undefined KB shortcut");
        }

        if(!d(languages))
        {
            languages = '';
            deblog("Undefined KB language");
        }

        thisClass.lzm_chatPollServer.PollServerResource({First:{
            rid: newRid,
            pid: newPid,
            ra: newRank,
            ti: newTitle,
            ty: newType,
            text: newText,
            si: newSize,
            t: newTags,
            oid: ownerOPId,
            g: ownerGRId,
            di: 0,
            isPublic: isPublic,
            fullTextSearch: fullTextSearch,
            shortcutWord: shortcutWord,
            allowBotAccess: allowBotAccess,
            languages: languages
        }}, "set");



        resource.p = isPublic;
        $('#resource-' + newRid + '-icon-and-text').html(lzm_chatDisplay.resourcesDisplay.getResourceIcon(resource) + '<span class="qrd-title-span">'+lzm_commonTools.htmlEntities(newTitle)+'</span>');
    });
    $('#cancel-edited-qrd').click(function() {

        if (inDialog) {
            lzm_displayHelper.removeDialogWindow('qrd-tree-dialog');
            var dialogContainerHtml = '<div id="qrd-tree-dialog-container" class="dialog-window-container"></div>';
            $('#chat_page').append(dialogContainerHtml).trigger('create');
            $('#qrd-tree-dialog-container').css(lzm_chatDisplay.dialogWindowContainerCss);
            $('#qrd-tree-dialog-container').replaceWith(lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId]);
            delete lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId];
            cancelQrd(ticketId);
        } else {
            lzm_displayHelper.removeDialogWindow('qrd-edit');
        }
    });
};

ChatUserActionsClass.prototype.previewQrd = function (chatPartner, qrdId, inDialog, menuEntry) {
    var thisClass = this;
    qrdId = (typeof qrdId != 'undefined' && qrdId != '') ? qrdId : thisClass.lzm_chatDisplay.selectedResource;
    var resource = DataEngine.cannedResources.getResource(qrdId);
    if (resource != null) {
        var thisChatPartner = lzm_displayHelper.getChatPartner(chatPartner);
        var chatPartnerName = thisChatPartner['name'];
        var chatPartnerUserid = thisChatPartner['userid'];
        thisClass.lzm_chatDisplay.resourcesDisplay.previewQrd(resource, chatPartner, chatPartnerName, chatPartnerUserid, inDialog, menuEntry);
    }
};

ChatUserActionsClass.prototype.addQrd = function(type, ticketId, inDialog, toAttachment, sendToChat, menuEntry) {
    inDialog = (typeof inDialog != 'undefined') ? inDialog : false;
    toAttachment = (typeof toAttachment != 'undefined') ? toAttachment : false;
    menuEntry = (typeof menuEntry != 'undefined') ? menuEntry : '';
    sendToChat = (typeof sendToChat != 'undefined') ? sendToChat : null;
    type = (d(type)) ? type : 1;

    var resourceText = (ticketId != '') ? this.lzm_chatDisplay.ticketResourceText[ticketId] : '';
    var thisClass = this;
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);

    resource = (resource != null) ? resource : {rid: 100, ra: 0};
    var newRid = md5(Math.random().toString());
    var newPid = '';

    if(toAttachment)
        newPid = '101';
    else if(sendToChat != null)
        newPid = '';
    else if(resource != null && resource.ty == 0)
        newPid = resource.rid;
    else if(resource != null)
        newPid = resource.pid;

    var newRank = (resource.ty == 0) ? parseInt(resource.ra) + 1 : parseInt(resource.ra);
    var newTitle, newType, newText, newSize, newTags;

    thisClass.lzm_chatDisplay.resourcesDisplay.addQrd(type, resource, ticketId, inDialog, toAttachment, sendToChat, menuEntry);

    var addResource = $('.qrd-add-resource');
    var addHtmlResource = $('.qrd-add-html-resource');
    var addLinkResource = $('.qrd-add-link-resource');
    var addFolderResource = $('.qrd-add-folder-resource');
    var addFileResource = $('.qrd-add-file-resource');
    var addTitle = $('#qrd-add-title');

    switch (type)
    {
        case 0: // Folder
            addResource.css('display', 'none');
            addResource.css('display', 'none');
            addHtmlResource.css('display', 'block');
            addFolderResource.css('display', 'block');
            addTitle.val(t('New Folder'));
            qrdTextEditor = new ChatEditorClass('qrd-add-text', false,false,false);
            qrdTextEditor.init('', 'addQrd');
            $('#save-new-qrd').removeClass('ui-disabled');
            $('#new-qrd-settings').removeClass('ui-disabled');

            setTimeout(function(){
                $('#qrd-add-title').select();
                $('#qrd-add-title').focus();
            },25);
            $("#qrd-add-text-div label[for='qrd-add-text']").html(tidc('description'));

            break;
        case 1: // HTML resource
            addResource.css('display', 'none');
            addHtmlResource.css('display', 'block');
            addTitle.val(t('New Text'));
            qrdTextEditor = new ChatEditorClass('qrd-add-text', false,false,false);
            qrdTextEditor.init('', 'addQrd');
            $('#save-new-qrd').removeClass('ui-disabled');
            $('#new-qrd-settings').removeClass('ui-disabled');

            break;
        case 2: // URL
            addResource.css('display', 'none');
            addLinkResource.css('display', 'block');
            if(sendToChat==null)
                addTitle.val(t('New Link Resource'));
            $('#save-new-qrd').removeClass('ui-disabled');
            $('#new-qrd-settings').removeClass('ui-disabled');
            $('#qrd-add-title').select();
            break;
        case 3: // File
            addResource.css('display', 'none');
            addFileResource.css('display', 'block');
            addTitle.val(t('New File Resource'));
            $('#save-new-qrd').removeClass('ui-disabled');
            $('#new-qrd-settings').removeClass('ui-disabled');
    }

    UIRenderer.resizeAddResources();



    if (typeof ticketId != 'undefined' && ticketId != '')
    {
        addResource.css('display', 'none');
        addHtmlResource.css('display', 'block');
        addTitle.val(t('New Text'));
        if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        {
            qrdTextEditor = new ChatEditorClass('qrd-add-text');
            qrdTextEditor.init(resourceText, 'addQrd');
        }
        else
            $('#qrd-add-text').val(resourceText);

    }

    if (toAttachment)
    {
        addResource.css('display', 'none');
        addFileResource.css('display', 'block');
        addTitle.val(t('New File Resource'));
    }


    $('#save-new-qrd').click(function() {
        var addTitle = $('#qrd-add-title').val(), newUrl = '';
        var addTags = $('#add-resource').data('tags');//$('#qrd-add-tags').val();
        newTitle = addTitle;
        newType = type;
        if (newType != 3)
        {
            switch (type)
            {
                case 0:
                    if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
                    {
                        newText = qrdTextEditor.grabHtml();
                        delete qrdTextEditor;
                    }
                    else
                        newText = $('#qrd-add-text').val();
                    newSize = newText.length + newTitle.length;
                    newTags = '';
                    break;
                case 1:
                    if ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
                    {
                        newText = qrdTextEditor.grabHtml();
                        delete qrdTextEditor;
                    }
                    else
                        newText = $('#qrd-add-text').val();
                    newSize = newText.length + newTitle.length;
                    newTags = addTags;
                    break;
                case 2:
                    newUrl = $('#qrd-add-url').val();
                    newText = $('#qrd-add-url').val();
                    newSize = newText.length + newTitle.length;
                    newTags = addTags;
                    break;
            }


            var isPublic = $('#add-resource').data('is_public');
            var fullTextSearch = $('#add-resource').data('full_text_search');
            var shortcutWord = $('#add-resource').data('shorcut_word');
            var allowBotAccess = $('#add-resource').data('allow_bot');
            var languages = $('#add-resource').data('languages');
            var ownerOPId = DataEngine.myId;
            var ownerGRId = '';

            if(resource != null && resource.ty == 0)
                ownerGRId = resource.g;

            if (inDialog)
            {
                lzm_displayHelper.removeDialogWindow('qrd-tree-dialog');
                var dialogContainerHtml = '<div id="qrd-tree-dialog-container" class="dialog-window-container"></div>';
                $('#chat_page').append(dialogContainerHtml).trigger('create');
                $('#qrd-tree-dialog-container').css(lzm_chatDisplay.dialogWindowContainerCss);
                $('#qrd-tree-dialog-container').replaceWith(lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId]);
                delete lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId];
                cancelQrd(ticketId);
                $('#ticket-reply-input-save').removeClass('ui-disabled');
                $('#ticket-reply-input-resource').val(newRid);
            }
            else
            {
                lzm_displayHelper.removeDialogWindow('qrd-add');
            }
            if (sendToChat == null)
            {
                thisClass.lzm_chatPollServer.PollServerResource({First:{
                    rid: newRid,
                    pid: newPid,
                    ra: newRank,
                    ti: newTitle,
                    ty: newType,
                    text: newText,
                    si: newSize,
                    t: newTags,
                    di: 0,
                    oid: ownerOPId,
                    g: ownerGRId,
                    isPublic: isPublic,
                    fullTextSearch: fullTextSearch,
                    shortcutWord: shortcutWord,
                    allowBotAccess: allowBotAccess,
                    languages: languages
                }}, "set");

                var newResource = {di: 0, ed: lzm_chatTimeStamp.getServerTimeString(null, true), eid: DataEngine.myId,
                    md5: '', oid: DataEngine.myId, pid: newPid, ra: newRank, rid: newRid, si: newSize, t: newTags,
                    text: newText, ti: newTitle, ty: newType};

                DataEngine.cannedResources.setResource(newResource);
            }
        }
        else
        {
            if (sendToChat == null)
            {
                uploadFile('user_file', newPid, newRank, toAttachment, null);
            }
            else
            {
                uploadFile('user_file', null, null, false, sendToChat);
            }
        }
        lzm_chatDisplay.resourcesDisplay.updateResources();
        handleResourceClickEvents(newPid, true);
    });
    $('#cancel-new-qrd').click(function() {
        if (inDialog) {
            if (toAttachment) {
                lzm_displayHelper.removeDialogWindow('ticket-details');
                lzm_displayHelper.maximizeDialogWindow(toAttachment);
            } else {
                lzm_displayHelper.removeDialogWindow('qrd-tree-dialog');
                var dialogContainerHtml = '<div id="qrd-tree-dialog-container" class="dialog-window-container"></div>';
                $('#chat_page').append(dialogContainerHtml).trigger('create');
                $('#qrd-tree-dialog-container').css(lzm_chatDisplay.dialogWindowContainerCss);
                $('#qrd-tree-dialog-container').replaceWith(lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId]);
                delete lzm_chatDisplay.resourcesDisplay.qrdTreeDialog[ticketId];
                cancelQrd(ticketId);
            }
        } else {
            lzm_displayHelper.removeDialogWindow('qrd-add');
        }
    });

};

ChatUserActionsClass.prototype.deleteQrd = function() {
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null) {
        resource.di = 1;
        this.lzm_chatPollServer.PollServerResource({First:resource}, "set");
        $('#qrd-search-line-' + resource.rid).remove();
        $('#qrd-recently-line-' + resource.rid).remove();
        $('#qrd-d-search-line-' + resource.rid).remove();
        $('#qrd-d-recently-line-' + resource.rid).remove();
        $('#resource-' + resource.rid).remove();
        $('#resource-d-' + resource.rid).remove();
        if (resource.ty == 0){
            $('#folder-' + resource.rid).remove();
            $('#folder-d-' + resource.rid).remove();
        }
    }
};

ChatUserActionsClass.prototype.deleteTicket = function(ticketId, silent) {

    silent = (d(silent)) ? silent : false;
    if (lzm_commonPermissions.checkUserPermissions('','tickets', 'delete_tickets', {}))
    {
        this.lzm_chatPollServer.pollServerTicket([{id: ticketId}], [], 'delete-ticket');
        lzm_chatDisplay.ticketReadArray = lzm_commonTools.removeTicketFromReadStatusArray(ticketId, lzm_chatDisplay.ticketReadArray);
        for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++) {
            if (lzm_chatDisplay.ticketListTickets[i].id == ticketId) {
                lzm_chatDisplay.ticketListTickets[i].del = 1;
                break;
            }
        }
        $('#ticket-list-row-' + ticketId).remove();
    }
    else if(!silent)
    {
        showNoPermissionMessage();
    }
};

ChatUserActionsClass.prototype.sendTicketReply = function (ticket, receiver, cc, bcc, subject, message, comment, attachments, messageId, previousMessageId, addToWL) {

    var key,receiverf,receiverp;

    bcc = bcc.replace(/ /g,'').replace(/\(/g,'').replace(/\)/g,'').replace(/;/g,',');
    cc = cc.replace(/ /g,'').replace(/\(/g,'').replace(/\)/g,'').replace(/;/g,',');
    receiver = receiver.replace(/ /g,'').replace(/\(/g,'').replace(/\)/g,'').replace(/;/g,',');

    receiverf = receiver;
    receiverp = receiver;

    if(cc.length)
    {
        cc = cc.split(',');
        for(key in cc)
        {
            if(cc[key].length)
            {
                receiverf += ((receiverf.length) ? ',' : '') + cc[key] + '(cc)';
                receiverp += ((receiverp.length) ? ',' : '') + cc[key];
            }
        }
    }

    if(bcc.length)
    {
        bcc = bcc.split(',');
        for(key in bcc)
        {
            if(bcc[key].length)
            {
                receiverf += ((receiverf.length) ? ',' : '') + bcc[key] + '(bcc)';
                receiverp += ((receiverp.length) ? ',' : '') + bcc[key];
            }
        }
    }

    receiverf = receiverf.replace(/,,/g,',');
    receiverp = receiverp.replace(/,,/g,',');

    this.lzm_chatPollServer.pollServerTicket([{id: ticket.id, ed: this.lzm_chatDisplay.myId, me: message, recp: receiverp, recf: receiverf, lg: ticket.l, gr: ticket.gr, su: subject, mid: messageId, comment: comment, attachments: attachments, pmid: previousMessageId}], [], 'send-message');
    if(addToWL.length>0)
    {
        var tList = [];
        for (i=0; i<addToWL.length; i++)
            tList.push({id: ticket.id,operatorId: addToWL[i]});
        this.addTicketToWatchList(tList);
    }
};

ChatUserActionsClass.prototype.setTicketPriority = function(list) {
    this.lzm_chatPollServer.pollServerTicket(list,[],'set-priority');
};

ChatUserActionsClass.prototype.addTicketToWatchList = function(list) {
    this.lzm_chatPollServer.pollServerTicket(list,[],'add-to-watch-list');
};

ChatUserActionsClass.prototype.removeTicketFromWatchList = function(list) {
    this.lzm_chatPollServer.pollServerTicket(list,[],'remove-from-watch-list');
};

ChatUserActionsClass.prototype.saveTicketComment = function(ticketId, messageId, commentText) {
    this.lzm_chatPollServer.pollServerTicket([{id: ticketId, mid: messageId, text: commentText}], [], 'add-comment');
};

ChatUserActionsClass.prototype.saveEmailChanges = function(emailChanges, ticketsCreated) {
    var emails = [emailChanges, ticketsCreated];
    this.lzm_chatPollServer.pollServerTicket([], emails, 'email-changes');
};
