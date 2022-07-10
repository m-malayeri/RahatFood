/****************************************************************************************
 * LiveZilla chat.js
 *
 * Copyright 2016 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/
var lzm_commonConfig = {};
var lzm_chatTimeStamp = {};
var lzm_commonTools = {};
var lzm_chatDisplay = {};
var lzm_displayHelper = {};
var lzm_commonDialog = {};
var lzm_commonStorage = {};
var lzm_commonPermissions = {};
var lzm_t = {};
var DataEngine = {};
var CommunicationEngine = {};
var UserActions = {};
var UIRenderer = {};
var loopCounter = 0;
var lzm_chatInputEditor;
var messageEditor;
var qrdTextEditor;
var deviceId = 0;
var debugBackgroundMode = false;
var ticketLineClicked = 0;
var mobile;
var lastTypingEvent = 0;
var runningInIframe = false;
var cookieCredentialsAreSet = false;
var chatMessageEditorIsPresent = false;
var vsPanelTouchPos = null;
var doBlinkTitle = true;
var blinkTitleMessage = '';
var printWindow = null;
var shortCutResources = [];
var lastOpListClick = [null, 0];
var quickSearchReady = false;

IFManager.IsMobileOS = isMobile;
IFManager.IsTabletOS = isTablet;
IFManager.IsAppFrame = (app == 1);
IFManager.AppOS = appOs;

if(!console) {console={}; console.log = function(){};}

if (IFManager.IsAppFrame && (IFManager.AppOS == IFManager.OS_IOS || IFManager.AppOS == IFManager.OS_WINDOWSPHONE))
{
    console.log = function(myString){
        IFManager.IFLog(myString,'log');
    };
    console.info = function(myString) {
        IFManager.IFLog(myString,'info');
    };
    console.warn = function(myString) {
        IFManager.IFLog(myString,'warn');
    };
    console.error = function(myString) {};
}

console.logit = function(obj){
    console.log(lzm_commonTools.clone(obj));
};

console.stack = function(){
    try{
        var err = new Error();
        console.log(err.stack);
    }catch(e){}
};

/**************************************** Hash functions ****************************************/

if (typeof CryptoJS.SHA256 != 'undefined') {
    var sha256 = function(str) {
        str = (typeof str == 'undefined') ? 'undefined' : (str == null) ? 'null' : str.toString();
        return CryptoJS.SHA256(str).toString();
    };
}

if (typeof CryptoJS.SHA1 != 'undefined') {
    var sha1 = function(str) {
        str = (typeof str == 'undefined') ? 'undefined' : (str == null) ? 'null' : str.toString();
        return CryptoJS.SHA1(str).toString();
    };
}

if (typeof CryptoJS.MD5 != 'undefined') {
    var md5 = function(str) {
        str = (typeof str == 'undefined') ? 'undefined' : (str == null) ? 'null' : str.toString();
        return CryptoJS.MD5(str).toString();
    };
}

/**************************************** Debugging functions ****************************************/

function forceResizeNow() {
    lzm_chatDisplay.createViewSelectPanel();
    lzm_chatDisplay.createChatWindowLayout(true);
}

function debuggingEditorClicked() {

}

function debuggingStartStopPolling() {
    var tmpDate = lzm_chatTimeStamp.getLocalTimeObject();
    if (CommunicationEngine.poll_regularly) {
        CommunicationEngine.stopPolling();
        debugBackgroundMode = true;
    } else {
        CommunicationEngine.startPolling();
        debugBackgroundMode = false;
    }
}

function debcount(){
    var dc = '';
    var counts = $.find('div').length+$.find('span').length+$.find('p').length+$.find('table').length+$.find('tr').length+$.find('td').length;
    dc+='\nDIV: ' + $.find('div').length.toString();
    dc+='\nSPAN: ' + $.find('span').length.toString();
    dc+='\nP: ' + $.find('p').length.toString();
    dc+='\nTABLE: ' + $.find('table').length.toString();
    dc+='\nTR: ' + $.find('tr').length.toString();
    dc+='\nTD: ' + $.find('td').length.toString();
    dc+='\nTOTAL: ' + counts.toString();
    alert(dc);
}

function logit(myObject, myLevel) {}

function deblog(data){
    try
    {
        console.logit(data.stack);
        console.logit(data.message);

        handleClientError(data.message,'',data.stack);
    }
    catch(e)
    {

    }
}

function handleClientError(errorMessage, errorUrl, errorLine){
    Client.Logs.push(errorMessage + ' | '  + errorUrl  + ' | ' + errorLine);
    lzm_chatDisplay.createMainMenuPanel();
}

function LoadModuleConfiguration(type,call){
    if(lzm_chatDisplay[type] != null && call){
        $.globalEval(call);
        return;
    }
    var file = (type.indexOf('Class')==-1) ? type+'Class' : type;
    $.getScript('js/lzm/classes/'+file+'.js', function( data, textStatus, jqxhr ) {
        $.globalEval('lzm_chatDisplay.'+type+' = new '+type+'();');
        if(call)
            $.globalEval(call);
    });
}

function showAppIsSyncing() {
    lzm_displayHelper.blockUi({message: tid('syncing_data')});
}

function chatInputEnterPressed() {
    var useResource = '';
    if(d(shortCutResources))
        for (var i=0; i<shortCutResources.length; i++)
            if (shortCutResources[i].complete) {
                useResource = shortCutResources[i].id;
                break;
            }

    var edContent = grabEditorContents();
    if (useResource != '')
    {
        var resource = DataEngine.cannedResources.getResource(useResource);
        if (resource != null && $.inArray(resource.ty, ['2', '3', '4']) != -1 && ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) && ChatManager.ActiveChat != 'LIST')
            sendQrdPreview(useResource, ChatManager.ActiveChat);
        else if (resource != null && $.inArray(resource.ty, ['2', '3', '4']) != -1 && ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) && ChatManager.ActiveChat == 'LIST')
        {

        }
        else
            useEditorQrdPreview(useResource);
    }
    else if (!quickSearchReady && edContent.indexOf('/') == 0)
    {

    }
    else
    {
        quickSearchReady = false;
        var cpId = $('#chat-input-body').data('cp-id');
        SendTranslatedChat(edContent, cpId);
    }
    chatScrollDown(3);
}

function doNothing() {
    // Dummy function that does nothing!
    // Needed for editor events
}

function chatScrollDown(_call){
    $('#chat-progress').scrollTop($('#chat-progress')[0].scrollHeight);
}

function chatInputTyping(e) {

    ChatEditorClass.__UpdateChatInputSize();

    var shortcut,previewHeight = 0,i = 0;
    if (typeof e != 'undefined' && (typeof e.which == 'undefined' || (e.which != 13 && e.which != 0)) && (typeof e.keyCode == 'undefined' || (e.keyCode != 13 && e.keyCode != 0)))
    {
        lastTypingEvent = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
        if (lzm_chatDisplay.qrdAutoSearch == 1)
        {
            quickSearchReady = false;
            shortCutResources = [];
            setTimeout(function() {
                var typingNow = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
                $('#chat-qrd-preview').html('');
                if (typingNow - lastTypingEvent > 450) {
                    var editorContents = grabEditorContents().replace(/<.*?>/g, '');
                    if (editorContents.length > 1) {
                        var frequentlyUsedResources = DataEngine.cannedResources.getResourceList('usage_counter', {ty: '1,2,3,4', t: editorContents, text: editorContents, ti: editorContents, s: editorContents});
                        var maxIterate = Math.min(10, frequentlyUsedResources.length), furHtml = '';
                        if ($('#chat-progress').height() > 200 && frequentlyUsedResources.length > 0)
                        {
                            furHtml += '<table style="width:100%">';
                            for (i=0; i<maxIterate; i++)
                            {
                                var resourceText = '<span>' + lzm_commonTools.htmlEntities(frequentlyUsedResources[i].text.replace(/<.*?>/g, '')) + '</span>';

                                if(frequentlyUsedResources[i].ty == '3')
                                    resourceText = '<span>' + lzm_commonTools.htmlEntities(frequentlyUsedResources[i].ti.replace(/<.*?>/g, '')) + '</span>';

                                shortcut = (frequentlyUsedResources[i].s.length) ? '<span class="editor-preview-shortcut" id="editor-preview-shortcut-' + frequentlyUsedResources[i].rid +'">/' + frequentlyUsedResources[i].s + '</span>' : '';
                                resourceText = '<td class="editor-preview-cell"><div class="editor-preview-inner">' + shortcut + resourceText + '</div></td>';
                                if (editorContents.indexOf('/') == 0 && ('/' + frequentlyUsedResources[i].s.toLowerCase()).indexOf(editorContents.toLowerCase()) == 0)
                                    shortCutResources.push({id: frequentlyUsedResources[i].rid, complete: false});
                                furHtml += '<tr class="lzm-unselectable" style="cursor: pointer;" onclick="useEditorQrdPreview(\'' + frequentlyUsedResources[i].rid + '\');">' + resourceText + '</tr>';
                            }
                            furHtml += '</table>';

                            $('#chat-qrd-preview').html(furHtml);
                            lzm_chatDisplay.createChatWindowLayout(true);

                            previewHeight = $('#chat-qrd-preview').height();
                            $('#chat-progress').css({'bottom': (80 + previewHeight + ChatEditorClass.ExpandChatInputOffset) + 'px'});
                            chatScrollDown(1);

                            $('.editor-preview-inner').css({'max-width': ($('#chat-qrd-preview').width() - $('.editor-preview-shortcut').width() - 14)+'px'});

                            for (i=0; i<shortCutResources.length; i++)
                            {
                                var resource = DataEngine.cannedResources.getResource(shortCutResources[i].id);
                                shortCutResources[i].complete = (resource != null && '/' + resource.s == editorContents);

                            }
                            quickSearchReady = true;
                        }
                        else
                        {
                            shortCutResources = [];
                            quickSearchReady = true;
                        }
                    }
                    else
                    {
                        shortCutResources = [];
                        quickSearchReady = true;
                    }
                }
            }, 500);
        }
        CommunicationEngine.typingPollCounter = 0;
        if(CommunicationEngine.typingChatPartner != ChatManager.ActiveChat)
        {

            CommunicationEngine.typingChatPartner = ChatManager.ActiveChat;

            var chatobj = DataEngine.ChatManager.GetChat();
            if(chatobj != null)
            {
                if(chatobj.Type == Chat.Operator && DataEngine.operators.getOperator(chatobj.SystemId).status != 2)
                {
                    CommunicationEngine.InstantPoll();
                }
                else if(chatobj.Type == Chat.Visitor)
                {
                    CommunicationEngine.InstantPoll();
                }
                else
                    CommunicationEngine.typingChatPartner = '';
            }
        }
    }
    else if (typeof e != 'undefined' && (typeof e.which == 'undefined' || e.which != 0) && (typeof e.keyCode == 'undefined' || e.keyCode != 0))
    {
        $('#chat-qrd-preview').html('');
        shortCutResources = [];
        quickSearchReady = true;
        lzm_chatDisplay.createChatWindowLayout(true);
    }

    $('#chat-progress').css({'bottom': (80 + previewHeight + ChatEditorClass.ExpandChatInputOffset) + 'px'});
}

function slowDownPolling(doSlowDown, secondCall) {
    secondCall = (typeof secondCall != 'undefined') ? secondCall : false;
    if (doSlowDown) {
        if (CommunicationEngine.slowDownPolling1 > CommunicationEngine.slowDownPolling2) {
            CommunicationEngine.slowDownPolling = true;
            CommunicationEngine.startPolling();
        } else if (!secondCall) {
            CommunicationEngine.slowDownPolling1 = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
            setTimeout(function() {
                slowDownPolling(true, true);
            }, 20000);
        }
    } else {
        CommunicationEngine.slowDownPolling = false;
        CommunicationEngine.slowDownPolling2 = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
        CommunicationEngine.startPolling();
    }
}

function setAppBackground(isInBackground) {
    if (isInBackground)
    {
        CommunicationEngine.appBackground = 1;
        CommunicationEngine.startPolling();
    }
    else
    {
        CommunicationEngine.appBackground = 0;
        CommunicationEngine.startPolling();
    }
}

function setAppVersion(versionName) {
    lzm_commonConfig.lz_app_version = versionName;
}

function startBackgroundTask() {
    IFManager.IFStartBackgroundTask();
}

function setLocation(latitude, longitude) {
    CommunicationEngine.location = {latitude: latitude, longitude: longitude};
}

function stopPolling() {
    CommunicationEngine.stopPolling();
}

function startPolling() {
    CommunicationEngine.startPolling();
}

function resetWebApp() {
    showAppIsSyncing();
    DataEngine.resetWebApp();
    UserActions.resetWebApp();
    CommunicationEngine.resetWebApp();
    lzm_chatDisplay.resetWebApp();
    lzm_chatDisplay.createViewSelectPanel();
    CommunicationEngine.lastCorrectServerAnswer = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
}

function logout(askBeforeLogout, logoutFromDeviceKey, e) {

    if(d(e))
        e.stopPropagation();

    logoutFromDeviceKey = (typeof logoutFromDeviceKey != 'undefined') ? logoutFromDeviceKey : false;
    lzm_chatDisplay.showUsersettingsHtml = false;
    $('#usersettings-menu').css({'display': 'none'});
    var doLogoutNow = function()
    {
        lzm_commonStorage.saveValue('qrd_id_list_' + DataEngine.myId, JSON.stringify([]));
        lzm_commonStorage.saveValue('ticket_max_read_time_' + DataEngine.myId, JSON.stringify(CommunicationEngine.ticketMaxRead));
        lzm_commonStorage.saveValue('ticket_read_array_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.ticketReadArray));
        lzm_commonStorage.saveValue('ticket_unread_array_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.ticketUnreadArray));
        lzm_commonStorage.saveValue('ticket_filter_' + DataEngine.myId, JSON.stringify(CommunicationEngine.ticketFilterStatus));
        lzm_commonStorage.saveValue('ticket_sort_' + DataEngine.myId, JSON.stringify(CommunicationEngine.ticketSort));
        lzm_commonStorage.saveValue('ticket_sort_dir_' + DataEngine.myId, JSON.stringify(CommunicationEngine.ticketSortDir));
        lzm_commonStorage.saveValue('email_read_array_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.emailReadArray));
        lzm_commonStorage.saveValue('accepted_chats_' + DataEngine.myId, UserActions.acceptedChatCounter);
        lzm_commonStorage.saveValue('qrd_search_categories_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.resourcesDisplay.KBSearchCategories));
        //lzm_commonStorage.saveValue('qrd_recently_used_' + DataEngine.myId, JSON.stringify([]));
        //lzm_commonStorage.deleteKeyValuePair('qrd_recently_used' + DataEngine.myId);
        lzm_commonStorage.saveValue('archive_filter_' + DataEngine.myId, JSON.stringify(CommunicationEngine.chatArchiveFilter));
        lzm_commonStorage.saveValue('first_visible_view_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.firstVisibleView));
        lzm_commonStorage.saveValue('ticket_filter_personal_' + DataEngine.myId, JSON.stringify(CommunicationEngine.ticketFilterPersonal));
        lzm_commonStorage.saveValue('ticket_filter_group_' + DataEngine.myId, JSON.stringify(CommunicationEngine.ticketFilterGroup));
        lzm_commonStorage.saveValue('show_offline_operators_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.showOfflineOperators));
        lzm_commonStorage.saveValue('last_phone_protocol_' + DataEngine.myId, JSON.stringify(lzm_chatDisplay.ticketDisplay.lastPhoneProtocol));
        lzm_chatDisplay.askBeforeUnload = false;
        lzm_displayHelper.blockUi({message: t('Signing off...')});
        CommunicationEngine.logout();
        setTimeout(function()
        {
            if (!CommunicationEngine.serverSentLogoutResponse)
                CommunicationEngine.finishLogout();
        }, 10000);
    };
    var showConfirmDialog = function(confirmText) {
        lzm_commonDialog.createAlertDialog(confirmText, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
        $('#alert-btn-ok').click(function() {
            doLogoutNow();
        });
        $('#alert-btn-cancel').click(function() {
            IFManager.ExitApp = false;
            lzm_commonDialog.removeAlertDialog();
        });
    };
    if (askBeforeLogout)
    {
        if (logoutFromDeviceKey)
        {
            if (DataEngine.ChatManager.GetChatsOf(DataEngine.myId,[Chat.Open,Chat.Active]).length == 0)
                showConfirmDialog(t('Do you really want to log out?'));
            else
                showConfirmDialog(t('There are still open chats, do you want to leave them?'));
        }
        else
        {
            if (DataEngine.ChatManager.GetChatsOf(DataEngine.myId,[Chat.Open,Chat.Active]).length != 0)
                showConfirmDialog(t('There are still open chats, do you want to leave them?'));
            else
                doLogoutNow();
        }
    }
    else
        doLogoutNow();
}

function catchEnterButtonPressed(e) {
        lzm_chatDisplay.catchEnterButtonPressed(e);
}

function doMacMagicStuff() {
    /*
    if (app == 0)
    {
        $(window).trigger('resize');
        setTimeout(function() {
            lzm_chatDisplay.DrawALL();
            lzm_chatDisplay.createViewSelectPanel();
            lzm_chatDisplay.createChatWindowLayout(true);
        }, 10);
    }*/
}

function preventDefaultContextMenu(e) {
    e.stopPropagation();
    e.preventDefault();
}

function nf(){

}

function d(param){
    return (typeof(param)!='undefined'&&param!='undefined');
}

function t(translateString, placeholderArray) {
    return lzm_t.translate(translateString, placeholderArray);
}

function tid(id, placeholderArray){
    return lzm_t.getById(id, placeholderArray);
}

function tidc(id, suffix){
    suffix = (typeof suffix != 'undefined') ? suffix : ':';

    var x = lzm_t.getById(id);

    if(lzm_commonTools.endsWith(x, suffix))
        return x;
    else
        return x + suffix;
}

function closeOrMinimizeDialog() {
    $('#minimize-dialog').click();
    $('#close-dialog').click()
}

function fillStringsFromTranslation() {
    if (loopCounter > 49 || lzm_t.translationArray.length != 0) {
        for (var i=0; i<lzm_chatDisplay.viewSelectArray.length; i++) {
            if (lzm_chatDisplay.viewSelectArray[i].id == 'mychats')
                lzm_chatDisplay.viewSelectArray[i].name = 'Chats';
            if (lzm_chatDisplay.viewSelectArray[i].id == 'tickets')
                lzm_chatDisplay.viewSelectArray[i].name = 'Tickets';
            if (lzm_chatDisplay.viewSelectArray[i].id == 'external')
                lzm_chatDisplay.viewSelectArray[i].name = 'Visitors';
            if (lzm_chatDisplay.viewSelectArray[i].id == 'archive')
                lzm_chatDisplay.viewSelectArray[i].name = 'Chat Archive';
            if (lzm_chatDisplay.viewSelectArray[i].id == 'internal')
                lzm_chatDisplay.viewSelectArray[i].name = 'Operators';
            if (lzm_chatDisplay.viewSelectArray[i].id == 'qrd')
                lzm_chatDisplay.viewSelectArray[i].name = 'Knowledge Base';
            if (lzm_chatDisplay.viewSelectArray[i].id == 'filter')
                lzm_chatDisplay.viewSelectArray[i].name = 'Filter';
        }
    }
    else {
        loopCounter++;
        setTimeout(function() {fillStringsFromTranslation();}, 50);
    }
}

function openLink(url, e) {
    if (typeof e != 'undefined')
    {
        e.preventDefault();
    }
    IFManager.IFOpenExternalBrowser(url);
}

function downloadFile(address) {

    IFManager.IFDownloadFile(address);
}

function tryNewLogin(logoutOtherInstance) {
    CommunicationEngine.stopPolling();
    CommunicationEngine.pollServerlogin(CommunicationEngine.chosenProfile.server_protocol,CommunicationEngine.chosenProfile.server_url, logoutOtherInstance);
}

function minimizeDialogWindow(dialogId, windowId) {
    try
    {

        if (typeof lzm_chatDisplay.dialogData.editors != 'undefined')
        {
            for (var i=0; i<lzm_chatDisplay.dialogData.editors.length; i++) {
                if (typeof window[lzm_chatDisplay.dialogData.editors[i].instanceName] != 'undefined') {
                    lzm_chatDisplay.dialogData.editors[i].text = window[lzm_chatDisplay.dialogData.editors[i].instanceName].grabHtml();
                    window[lzm_chatDisplay.dialogData.editors[i].instanceName].removeEditor();
                }
            }
        }
    } catch(e) {deblog(e);}
    var selectedView = (lzm_chatDisplay.dialogData['no-selected-view'] == true) ? '' : lzm_chatDisplay.selected_view;
    lzm_displayHelper.minimizeDialogWindow(dialogId, windowId, lzm_chatDisplay.dialogData, selectedView);
}

function maximizeDialogWindow(dialogId) {
    lzm_displayHelper.maximizeDialogWindow(dialogId);
}

function blinkPageTitle(message) {
    doBlinkTitle = true;
    blinkTitleMessage = message;
}

function getCredentials() {
    var cookieName = 'lzm-credentials';
    var cookieValue = document.cookie;
    var cookieStart = (cookieValue.indexOf(" " + cookieName + "=") != -1) ? cookieValue.indexOf(" " + cookieName + "=") : cookieValue.indexOf(cookieName + "=");
    var cookieEnd = 0;
    if (cookieStart == -1) {
        cookieValue = {'login_name': '', 'login_passwd': ''};
    } else {
        cookieStart = cookieValue.indexOf("=", cookieStart) + 1;
        cookieEnd = (cookieValue.indexOf(";", cookieStart) != -1) ? cookieValue.indexOf(";", cookieStart) : cookieValue.length;
        cookieValue = cookieValue.substring(cookieStart,cookieEnd);
        if (cookieValue.indexOf('%7E') != -1) {
            cookieCredentialsAreSet = (lz_global_base64_url_decode(cookieValue.split('%7E')[0]) != '' && cookieValue.split('%7E')[1] != '');
            cookieValue = {
                'login_name': lz_global_base64_url_decode(cookieValue.split('%7E')[0]),
                'login_passwd': cookieValue.split('%7E')[1]
            };
        } else {
            var ln = '', lp = '';
            if (typeof chosenProfile.lzmvcode != 'undefined' && chosenProfile.lzmvcode != '') {
                cookieCredentialsAreSet = true;
                ln = lz_global_base64_url_decode(lz_global_base64_url_decode(chosenProfile.lzmvcode).split('~')[0]);
                lp = lz_global_base64_url_decode(chosenProfile.lzmvcode).split('~')[1];
                }
            cookieValue = {'login_name': ln, 'login_passwd': lp};
        }
    }

    chosenProfile.login_name = cookieValue.login_name;
    chosenProfile.login_passwd = cookieValue.login_passwd;

    // Call this twice for some unknown reason...
    deleteCredentials();
    deleteCredentials();
}

function deleteCredentials() {
    var cookieName = 'lzm-credentials';
    var completeCookieValue = document.cookie;
    var cookieStart = (completeCookieValue.indexOf(" " + cookieName + "=") != -1) ? completeCookieValue.indexOf(" " + cookieName + "=") : completeCookieValue.indexOf(cookieName + "=");
    var cookieEnd = 0;
    if (cookieStart == -1) {
        return false;
    } else {
        cookieStart = completeCookieValue.indexOf("=", cookieStart) + 1;
        cookieEnd = (completeCookieValue.indexOf(";", cookieStart) != -1) ? completeCookieValue.indexOf(";", cookieStart) : completeCookieValue.length;
        var cookieValue = completeCookieValue.substring(cookieStart,cookieEnd);
        var pattern = new RegExp(cookieName + '=' + cookieValue,'');
        completeCookieValue = completeCookieValue.replace(pattern, cookieName + '=0');
        document.cookie = completeCookieValue;

        return true;
    }
}

function handleContextMenuClick(e) {
    e.stopPropagation();
}

function showNotMobileMessage() {
    var alertText =  t('This functionality is not available on mobile devices.');
    lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);

    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function showNotOnDevice() {
    var alertText = t('This functionality is not available on your device.');
    lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);

    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function showNoPermissionMessage() {
    var alertText =  tid('no_permission');
    lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);
    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function showNoAdministratorMessage() {
    var alertText =  t('You need to be a Server Administrator for this action.');
    lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);

    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function showOutsideOpeningMessage(groupName) {
    var alertText = (typeof groupName == 'undefined' || groupName == '') ? t('This action cannot be performed outside of opening hours.') :
        t('<!--group_name--> is outside of opening hours. Please select another group.', [['<!--group_name-->', groupName]]);
    lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);
    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function handleWindowResize(scrollDown) {
    lzm_chatDisplay.createViewSelectPanel();
    lzm_chatDisplay.createChatWindowLayout(true);
    if (scrollDown) {
        setTimeout(function() {
            chatScrollDown(2);
        }, 10);
    }
}

RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

function capitalize(myString) {
    myString = myString.replace(/^./, function (char) {
        return char.toUpperCase();
    });
    return myString;
}

/**************************************** Resources functions ****************************************/
function useEditorQrdPreview(resourceId) {
    var resource = DataEngine.cannedResources.getResource(resourceId), resourceHtmlText;
    if (resource != null) {
        UserActions.messageFromKnowledgebase = true;
        DataEngine.cannedResources.riseUsageCounter(resourceId);
        switch (resource.ty)
        {
            case '1':
                resourceHtmlText = ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) ? resource.text.replace(/<.*?>/g, '') : resource.text;
                break;
            case '2':
                var linkHtml = '<a href="' + resource.text + '" class="lz_chat_link" target="_blank">' + resource.ti + '</a>';
                resourceHtmlText = ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) ? resource.text : linkHtml;
                break;
            default:
                var urlFileName = encodeURIComponent(resource.ti.replace(/ /g, '+').replace(/<.*?>/g, ''));
                var acid = lzm_commonTools.pad(Math.floor(Math.random() * 1048575).toString(16), 5);
                var fileId = resource.text.split('_')[1];
                var thisServer = CommunicationEngine.chosenProfile.server_protocol + CommunicationEngine.chosenProfile.server_url;
                var thisFileUrl = thisServer + '/getfile.php?';
                thisFileUrl += 'acid=' + acid + '&file=' + urlFileName + '&id=' + fileId;
                var fileHtml = '<a ' +
                    'href="' + thisFileUrl + '" ' +
                    'class="lz_chat_file" target="_blank">' + resource.ti.replace(/<.*?>/g, '') + '</a>';
                resourceHtmlText = ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) ? thisFileUrl : fileHtml;
                break;
        }
        setEditorContents(resourceHtmlText);
        setFocusToEditor();
        shortCutResources = [];
    }
    $('#chat-qrd-preview').html('');
}

function openOrCloseFolder(resourceId, onlyOpenFolders, wasSelected) {
    var sid = (lzm_chatDisplay.resourcesDisplay.InDialog) ? 'd-' : '';
    var folderDiv = $('#'+sid+'folder-' + resourceId);

    if (folderDiv.html() != "") {
        var markDiv = $('#'+sid+'resource-' + resourceId + '-open-mark');
        if (folderDiv.css('display') == 'none') {
            folderDiv.css('display', 'block');
            markDiv.html('<i class="fa fa-caret-down"></i>');
            if ($.inArray(resourceId, lzm_chatDisplay.resourcesDisplay.openedResourcesFolder) == -1) {
                lzm_chatDisplay.resourcesDisplay.openedResourcesFolder.push(resourceId);
            }
        } else if (!onlyOpenFolders)
        {
            if(!wasSelected)
                return;

            folderDiv.css('display', 'none');
            markDiv.html('<i class="fa fa-caret-right"></i>');
            var tmpOpenedFolder = [];
            for (var i=0; i<lzm_chatDisplay.resourcesDisplay.openedResourcesFolder.length; i++) {
                if (resourceId != lzm_chatDisplay.resourcesDisplay.openedResourcesFolder[i]) {
                    tmpOpenedFolder.push(lzm_chatDisplay.resourcesDisplay.openedResourcesFolder[i]);
                }
            }
            lzm_chatDisplay.resourcesDisplay.openedResourcesFolder = tmpOpenedFolder;
        }
    }

}

function handleResourceClickEvents(resourceId, onlyOpenFolders){
    removeQrdContextMenu();
    onlyOpenFolders = (typeof onlyOpenFolders != 'undefined') ? onlyOpenFolders : false;

    var sid = (lzm_chatDisplay.resourcesDisplay.InDialog) ? 'd-' : '';
    lzm_chatDisplay.selectedResource = resourceId;
    var resource = DataEngine.cannedResources.getResource(resourceId);

    if(!lzm_chatDisplay.resourcesDisplay.InDialog)
        lzm_chatDisplay.resourcesDisplay.SetPreview(resource);

    if (resource != null)
    {
        var parentFolder = DataEngine.cannedResources.getResource(resource.pid);
        var wasSelected = $('#'+sid+'resource-' + resourceId).hasClass('selected-resource-div');

        $('.resource-div').removeClass('selected-resource-div');
        $('.qrd-search-line').removeClass('selected-table-line');
        $('.qrd-recently-line').removeClass('selected-table-line');
        $('.resource-open-mark').removeClass('resource-open-mark-selected');
        $('.resource-icon-and-text').removeClass('resource-icon-and-text-selected');

        lzm_chatDisplay.resourcesDisplay.highlightSearchResults(DataEngine.cannedResources.CacheResourceList, false);

        $('#'+sid+'resource-' + resourceId).addClass('selected-resource-div');
        $('#qrd-'+sid+'search-line-' + resourceId).addClass('selected-table-line');
        $('#qrd-'+sid+'recently-line-' + resourceId).addClass('selected-table-line');
        $('#'+sid+'resource-' + resourceId + '-open-mark').addClass('resource-open-mark-selected');
        $('#'+sid+'resource-' + resourceId + '-icon-and-text').addClass('resource-icon-and-text-selected');
        $('.qrd-change-buttons').addClass('ui-disabled');

        switch (parseInt(resource.ty))
        {
            case 0:
                openOrCloseFolder(resourceId, onlyOpenFolders, wasSelected);
                if (resourceId != '1' && lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource)) {
                    $('#edit-qrd').removeClass('ui-disabled');
                    $('#show-qrd-settings').removeClass('ui-disabled');
                }

                if (lzm_chatDisplay.resourcesDisplay.SelectedResourceTab == 0 && lzm_commonPermissions.checkUserPermissions('', 'resources', 'add', resource))
                    $('#add-qrd').removeClass('ui-disabled');

                if (resourceId != '1' && lzm_commonPermissions.checkUserPermissions('', 'resources', 'delete', resource)) {
                    $('#delete-qrd').removeClass('ui-disabled');
                }
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'add', resource)) {
                    $('#add-or-edit-qrd').removeClass('ui-disabled');
                }
                $('#add-qrd-attachment').addClass('ui-disabled');
                break;
            case 1:
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource)) {
                    $('#edit-qrd').removeClass('ui-disabled');
                    $('#show-qrd-settings').removeClass('ui-disabled');
                }
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'delete', resource)) {
                    $('#delete-qrd').removeClass('ui-disabled');
                }
                $('#view-qrd').removeClass('ui-disabled');

                $('#'+sid+'send-qrd-preview').removeClass('ui-disabled');

                $('#insert-qrd-preview').removeClass('ui-disabled');
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'add', resource)) {
                    $('#add-or-edit-qrd').removeClass('ui-disabled');
                }
                if (lzm_chatDisplay.resourcesDisplay.SelectedResourceTab == 0 && parentFolder != null && lzm_commonPermissions.checkUserPermissions('', 'resources', 'add', parentFolder))
                    $('#add-qrd').removeClass('ui-disabled');

                $('#add-qrd-attachment').addClass('ui-disabled');
                break;
            case 2:
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource)) {
                    $('#edit-qrd').removeClass('ui-disabled');
                    $('#show-qrd-settings').removeClass('ui-disabled');
                }
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'delete', resource)) {
                    $('#delete-qrd').removeClass('ui-disabled');
                }
                $('#view-qrd').removeClass('ui-disabled');

                $('#'+sid+'send-qrd-preview').removeClass('ui-disabled');

                $('#insert-qrd-preview').removeClass('ui-disabled');

                if (lzm_chatDisplay.resourcesDisplay.SelectedResourceTab == 0 && parentFolder != null && lzm_commonPermissions.checkUserPermissions('', 'resources', 'add', parentFolder))
                    $('#add-qrd').removeClass('ui-disabled');

                $('#add-qrd-attachment').addClass('ui-disabled');
                break;
            default:
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource)) {
                    $('#show-qrd-settings').removeClass('ui-disabled');
                }
                if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'delete', resource)) {
                    $('#delete-qrd').removeClass('ui-disabled');
                }

                $('#'+sid+'send-qrd-preview').removeClass('ui-disabled');

                $('#insert-qrd-preview').removeClass('ui-disabled');

                if (lzm_chatDisplay.resourcesDisplay.SelectedResourceTab == 0 && parentFolder != null && lzm_commonPermissions.checkUserPermissions('', 'resources', 'add', parentFolder))
                    $('#add-qrd').removeClass('ui-disabled');

                $('#add-qrd-attachment').removeClass('ui-disabled');
                break;
        }
    }
}

function addQrd(type) {
    type = (d(type)) ? type : 1;
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null)
        if (!lzm_commonPermissions.checkUserResourceWritePermissions(lzm_chatDisplay.myId, 'add', resource))
        {
            showNoPermissionMessage();
            return;
        }

    var storedPreviewId = '';
    for (var key in lzm_chatDisplay.StoredDialogs) {
        if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
            if (lzm_chatDisplay.StoredDialogs[key].type == 'add-resource' &&
                typeof lzm_chatDisplay.StoredDialogs[key].data['resource-id'] != 'undefined' &&
                lzm_chatDisplay.StoredDialogs[key].data['resource-id'] == lzm_chatDisplay.selectedResource) {
                storedPreviewId = key;
            }
        }
    }

    if (storedPreviewId != '')
        lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
    else
        UserActions.addQrd(type);

    removeQrdContextMenu();
}

function addQrdToChat(kbType) {
    if (((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) || kbType == 2)
    {
        var dialogId = 'add-qrd-to-chat-' + md5(Math.random().toString());
        //var visBro = VisitorManager.GetVisitorBrowser(ChatManager.ActiveChat);
        var cpName = '';//(visBro[1] != null && visBro[1].cname != '') ? lzm_commonTools.escapeHtml(visBro[1].cname) : (visBro[0] != null) ? visBro[0].unique_name : lzm_chatDisplay.getActiveChatRealname();
        UserActions.addQrd(kbType,'', false, false, {type: kbType, dialog_id: dialogId, chat_partner: ChatManager.ActiveChat, cp_name: cpName}, '');
    }
    else
        showNotMobileMessage();
}

function syncKB(){
    if(lzm_chatDisplay.resourcesDisplay.CachePreparedResources != null && lzm_chatDisplay.resourcesDisplay.CachePreparedResources[1].length==1)
        return;

    lzm_commonStorage.deleteKeyValuePair('qrd_' + DataEngine.myId);
    lzm_commonStorage.deleteKeyValuePair('qrd_request_time_' + DataEngine.myId);
    lzm_commonStorage.deleteKeyValuePair('qrd_id_list_' + DataEngine.myId);
    lzm_chatDisplay.resourcesDisplay.IsLoading = true;
    DataEngine.resourceIdList = [];
    DataEngine.resources = [];
    DataEngine.resourceLastEdited = 0;
    CommunicationEngine.qrdRequestTime = 1;
    DataEngine.cannedResources = new LzmResources();
    lzm_chatDisplay.resourcesDisplay.invalidateCache();
    lzm_chatDisplay.resourcesDisplay.updateResources();
    SelectView('qrd',true);
}

function deleteQrd() {
    removeQrdContextMenu();
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null) {
        if (!lzm_commonPermissions.checkUserPermissions('', 'resources', 'delete', resource))
        {
            showNoPermissionMessage();
            return;
        }
    }
    var confirmText = t('Do you want to delete this entry including subentries irrevocably?');
    lzm_commonDialog.createAlertDialog(confirmText, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
    $('#alert-btn-ok').click(function() {
        UserActions.deleteQrd();
        lzm_commonDialog.removeAlertDialog();
    });
    $('#alert-btn-cancel').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function renameQrd() {
    // Perhaps not needed
}

function editQrd() {
    removeQrdContextMenu();
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null)
    {
        if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource))
        {
            if (false/* && (IFManager.IsAppFrame || IFManager.IsMobileOS) && resource.ty == 1*/)
            {
                //showNotMobileMessage();
            }
            else
            {
                var storedPreviewId = '';
                for (var key in lzm_chatDisplay.StoredDialogs) {
                    if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                        if (lzm_chatDisplay.StoredDialogs[key].type == 'edit-resource' &&
                            typeof lzm_chatDisplay.StoredDialogs[key].data['resource-id'] != 'undefined' &&
                            lzm_chatDisplay.StoredDialogs[key].data['resource-id'] == lzm_chatDisplay.selectedResource) {
                            storedPreviewId = key;
                        }
                    }
                }
                if (storedPreviewId != '') {
                    lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
                } else {
                    UserActions.editQrd(resource);
                }
            }
        }
        else
            showNoPermissionMessage();
    }
}

function previewQrd(chatPartner, qrdId, inDialog, menuEntry, contextMenu) {

    contextMenu = (typeof contextMenu != 'undefined') ? contextMenu : false;

    // qrdId = ''
    // menuEntry = ''
    // inDialog = false;
    // chatPartner = ''

    removeQrdContextMenu();


    if(!contextMenu && !inDialog && lzm_chatDisplay.windowWidth > 800)
    {
        lzm_chatDisplay.resourcesDisplay.ShowPreview = !lzm_chatDisplay.resourcesDisplay.ShowPreview;
        UIRenderer.resizeResources();
        return;
    }

    var storedPreviewId = '';

    chatPartner = (typeof chatPartner != 'undefined' && chatPartner != '') ? chatPartner : '';
    qrdId = (typeof qrdId != 'undefined' && qrdId != '') ? qrdId : lzm_chatDisplay.selectedResource;
    for (var key in lzm_chatDisplay.StoredDialogs) {
        if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
            if (lzm_chatDisplay.StoredDialogs[key].type == 'preview-resource' &&
                typeof lzm_chatDisplay.StoredDialogs[key].data['resource-id'] != 'undefined' &&
                lzm_chatDisplay.StoredDialogs[key].data['resource-id'] == qrdId) {
                storedPreviewId = key;
            }
        }
    }
    if (storedPreviewId != '')
    {
        lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
    }
    else
    {
        UserActions.previewQrd(chatPartner, qrdId, inDialog, menuEntry, contextMenu);
    }
}

function getQrdDownloadUrl(resource) {
    var downloadUrl = DataEngine.serverProtocol + DataEngine.serverUrl.replace(':80','').replace(':443','') + '/getfile.php?';
    downloadUrl += 'a=' + lzm_commonTools.pad(Math.floor(Math.random() * 1048575).toString(16), 5) +
        '&file=' + resource.ti + '&id=' + resource.rid;
    return downloadUrl;
}

function getKBAccessUrl(resource) {
    var publicURL = DataEngine.serverProtocol + DataEngine.serverUrl.replace(':80','').replace(':443','') + '/knowledgebase.php?';
    publicURL += 'article=' + lz_global_base64_url_encode(resource.rid);
    return publicURL;
}

function showQrd(chatPartner, caller) {
    saveChatInput(ChatManager.ActiveChat);
    removeEditor();
    var storedPreviewId = '';
    for (var key in lzm_chatDisplay.StoredDialogs) {
        if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
            if (lzm_chatDisplay.StoredDialogs[key].type == 'qrd-tree' &&
                typeof lzm_chatDisplay.StoredDialogs[key].data['chat-partner'] != 'undefined' &&
                lzm_chatDisplay.StoredDialogs[key].data['chat-partner'] == chatPartner) {
                storedPreviewId = key;
            }
        }
    }
    if (storedPreviewId != '') {
        lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
    } else {
        lzm_chatDisplay.resourcesDisplay.createQrdTreeDialog(null, chatPartner);
    }
}

function cancelQrd(closeToTicket) {
    cancelQrdPreview(0);
    lzm_displayHelper.removeDialogWindow('qrd-tree-dialog');
    if (d(closeToTicket) && closeToTicket != '')
    {
        var dialogId = lzm_chatDisplay.ticketDialogId[closeToTicket] + '_reply';
        if (typeof lzm_chatDisplay.ticketDialogId[closeToTicket] == 'undefined' || closeToTicket.indexOf('_reply') != -1)
            dialogId = closeToTicket;
        lzm_displayHelper.maximizeDialogWindow(dialogId);
    }
    //SelectView('mychats');
    var loadedValue = loadChatInput(ChatManager.ActiveChat);
    initEditor(loadedValue, 'showVisitorChat');
}

function cancelQrdPreview() {
    var sid = (lzm_chatDisplay.resourcesDisplay.InDialog) ? 'd-' : '';
    //$('#'+sid+'preview-qrd').removeClass('ui-disabled');
    $('#qrd-preview-container').remove();
}

function sendQrdPreview(resourceId, chatPartner) {
    resourceId = (resourceId != '') ? resourceId : lzm_chatDisplay.selectedResource;
    var resourceHtmlText;
    var resource = DataEngine.cannedResources.getResource(resourceId);
    if (resource != null)
    {
        UserActions.messageFromKnowledgebase = true;
        DataEngine.cannedResources.riseUsageCounter(resourceId);
        switch (resource.ty)
        {
            case '1':
                resourceHtmlText = resource.text;
                break;
            case '2':
                if (resource.text.indexOf('mailto:') == 0)
                {
                    var linkHtml = '<a href="' + resource.text + '" class="lz_chat_mail" target="_blank">' + resource.ti + '</a>';
                }
                else
                {
                    var linkHtml = '<a href="' + resource.text + '" class="lz_chat_link" target="_blank">' + resource.ti + '</a>';
                }
                resourceHtmlText = linkHtml;
                break;
            default:
                var urlFileName = encodeURIComponent(resource.ti.replace(/ /g, '+'));
                var acid = lzm_commonTools.pad(Math.floor(Math.random() * 1048575).toString(16), 5);
                var fileId = resource.text.split('_')[1];
                var thisServer = CommunicationEngine.chosenProfile.server_protocol + CommunicationEngine.chosenProfile.server_url;
                var fileHtml = '<a href="' + thisServer + '/getfile.php?';

                fileHtml += 'acid=' + acid +
                    '&file=' + urlFileName +
                    '&id=' + fileId + '" ' +
                    'class="lz_chat_file" target="_blank">' + resource.ti + '</a>';
                resourceHtmlText = fileHtml;
                break;
        }
        var chatText = loadChatInput(chatPartner);
        if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
        {
            chatText = (chatText != '') ? chatText + ' ' : chatText;
            if ($.inArray(resource.ty, ['2', '3', '4']) != -1)
            {
                SendChat(resourceHtmlText, chatPartner, '');
            }
            else
            {
                var resourceTextText = resourceHtmlText.replace(/(<br>|<br\/>|<br \/>|<\/p>|<\/div>)+/g, ' ').
                    replace(/<a.*?href="(.*?)".*?>(.*?)<\/a.*?>/gi, '$2 ($1)').replace(/<.*?>/g, '').replace(/&[a-zA-Z0-9#]*?;/g, ' ').
                    replace(/ +/g, ' ');
                saveChatInput(chatPartner, chatText + resourceTextText);
            }
        }
        else
        {
            chatText = (chatText != '') ? '<div>' + chatText + '</div>' : chatText;
            saveChatInput(chatPartner, chatText + resourceHtmlText);
        }
        cancelQrd();
        SelectView('mychats');
    }
}

function showQrdSettings(resourceId, caller, editorText) {
    removeQrdContextMenu();
    resourceId = (resourceId == '') ? lzm_chatDisplay.selectedResource : resourceId;
    var resource = DataEngine.cannedResources.getResource(resourceId);
    if (resource == null)
    {
        resource = {t: ''};
        if (resourceId == 'FOLDER')
            resource.ty = 0;
    }
    if (resource != null)
    {
        if (resourceId == 'TEXT_FILE_URL' || resourceId == 'FOLDER' || lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource)) {
            var storedPreviewId = '';
            for (var key in lzm_chatDisplay.StoredDialogs) {
                if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                    if (lzm_chatDisplay.StoredDialogs[key].type == 'resource-settings' &&
                        typeof lzm_chatDisplay.StoredDialogs[key].data['resource-id'] != 'undefined' &&
                        lzm_chatDisplay.StoredDialogs[key].data['resource-id'] == lzm_chatDisplay.selectedResource) {
                        storedPreviewId = key;
                    }
                }
            }
            if (storedPreviewId != '') {
                lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
            } else {
                lzm_chatDisplay.resourcesDisplay.showQrdSettings(resource, editorText, caller);
            }
        }
        else
            showNoPermissionMessage();
    }
}

function changeFile(file) {
    var maxFileSize = DataEngine.global_configuration.php_cfg_vars.upload_max_filesize;

    if(!d(file))
        file = $('#file-upload-input')[0].files[0];

    KnowledgebaseUI.FileToUpload = file;

    if(!file) {

        $('#file-upload-name').html('');
        $('#file-upload-size').html('');
        $('#file-upload-progress').css({display: 'none'});
        $('#file-upload-numeric').html('');
        $('#file-upload-error').html('');
        $('#cancel-file-upload-div').css({display: 'none'});
        return;
    }

    var thisUnit = (file.size <= 10000) ? 'B' : (file.size <= 1024000) ? 'KB' : 'MB';
    var thisFileSize = (file.size <= 10000) ? file.size : (file.size <= 1024000) ? file.size / 1024 : file.size / 1048576;
    thisFileSize = Math.round(thisFileSize * 10) / 10;

    $('#file-upload-name').html(file.name);
    $('#file-upload-size').html(thisFileSize + ' ' + thisUnit);
    $('#file-upload-progress').css({display: 'none'});
    $('#file-upload-numeric').html('0%');
    $('#file-upload-error').html('');
    $('#cancel-file-upload-div').css({display: 'block'});

    if (file.size > maxFileSize)
    {
        $('#file-upload-input').val('');
        $('#file-upload-error').html(tid('file_too_large'));
        $('#save-new-qrd').addClass('ui-disabled');
    }
    else
        $('#save-new-qrd').removeClass('ui-disabled');
}

function uploadFile(fileType, parentId, rank, toAttachment, sendToChat) {

    sendToChat = (typeof sendToChat != 'undefined') ? sendToChat : null;
    $('#file-upload-input').prop('disabled',true);
    var file = KnowledgebaseUI.FileToUpload;
    if (typeof file != 'undefined')
    {
        $('#save-new-qrd').addClass('ui-disabled');
        $('#cancel-new-qrd').addClass('ui-disabled');
        $('#file-upload-progress').css({display: 'block'});
        $('#cancel-file-upload').css({display: 'inline'});

        CommunicationEngine.uploadFile(file, fileType, parentId, rank, toAttachment, sendToChat);
    }
    else
        $('#cancel-new-qrd').click();
}

function cancelFileUpload(e) {

    e.stopPropagation();
    CommunicationEngine.fileUploadClient.abort();
    $('#cancel-file-upload').css({display: 'none'});
    setTimeout(function(){
        $('#file-upload-input').prop('disabled',false);
    },500);
}

function showQrdAddMenu(e){
    openQrdContextMenu(e, 'LIST','MENU');
    e.stopPropagation();
}

function openQrdContextMenu(e, chatPartner, resourceId){
    if(resourceId != 'MENU')
        handleResourceClickEvents(resourceId, true);
    var resource = (resourceId != 'MENU') ? DataEngine.cannedResources.getResource(resourceId) : 'MENU';
    var scrolledDownY = (resourceId != 'MENU') ? $('#qrd-tree-body').scrollTop() : 15;
    var scrolledDownX = (resourceId != 'MENU') ? $('#qrd-tree-body').scrollLeft() : -15;
    var parentOffset = $('#qrd-tree-body').offset();
    var yValue = e.pageY - parentOffset.top;
    var xValue = e.pageX - parentOffset.left;
    if (resource != null)
    {
        resource.chatPartner = chatPartner;
        lzm_chatDisplay.showContextMenu('qrd-tree', resource, xValue + scrolledDownX, yValue + scrolledDownY);
        e.preventDefault();
    }
}

function removeQrdContextMenu() {
    $('#qrd-tree-context').remove();
}

function addLinkToChat(){
    removeVisitorChatActionContextMenu();
    lzm_chatInputEditor.addLink();
}

/**************************************** Chat functions ****************************************/
function chatInternalWith(id, userid, name, fromOpList) {

    if(DataEngine.myId == id)
        return;

    if (ChatManager.LastActiveChat != id)
        $('#chat-qrd-preview').html('');

    var op = DataEngine.operators.getOperator(id);
    if(op!=null && op.isbot)
        return;

    fromOpList = (d(fromOpList)) ? fromOpList : false;
    var group = DataEngine.groups.getGroup(id);
    var i = 0, myAction = 'chat', meIsInGroup = false;
    if (group != null && d(group.members))
    {
        for (i=0; i<group.members.length; i++)
            if (group.members[i].i == DataEngine.myId)
                meIsInGroup = true;

        if (meIsInGroup)
            myAction = 'chat';
        else if (lzm_commonPermissions.checkUserPermissions(DataEngine.myId, 'group', '', group))
            myAction = 'join';
        else
            myAction = 'no_perm';
    }
    else if(group != null)
        if($.inArray(group.id, DataEngine.operators.getOperator(DataEngine.myId).groups) == -1)
            myAction = 'no_perm';


    if (myAction == 'no_perm')
        showNoPermissionMessage();
    else
        try
        {
            hideAllchatsList();
            UserActions.chatInternalWith(id, userid, name, fromOpList);
            if (myAction == 'join')
                UserActions.SaveChatGroup('add', group.id, '', DataEngine.myId, {});
        }
        catch(e)
        {
            deblog(e);
        }
}

function showVisitorChat(id, b_id, chat_id, freeToChat) {


    if (ChatManager.LastActiveChat != id + '~' + b_id)
        $('#chat-qrd-preview').html('');

    hideAllchatsList();
    UserActions.showVisitorChat(id, b_id, chat_id, freeToChat);
}

function handleUploadRequest(fuprId, fuprName, id, b_id, type, chatId) {
    UserActions.handleUploadRequest(fuprId, fuprName, id, b_id, type, chatId);
}

function selectOperatorForForwarding(_chatObj, forward_id, forward_name, forward_group, forward_text, chat_no) {
    UserActions.selectOperatorForForwarding(_chatObj, forward_id, forward_name, forward_group,forward_text, chat_no);
}

function loadChatInput(active_chat_reco) {
    return UserActions.loadChatInput(active_chat_reco);
}

function saveChatInput(active_chat_reco, text) {
    UserActions.saveChatInput(active_chat_reco, text);
}

function showTranslateOptions(visitorChat, language){
    if (DataEngine.otrs != '' && DataEngine.otrs != null)
    {
        saveChatInput(ChatManager.ActiveChat);
        //removeEditor();
        lzm_chatDisplay.VisitorsUI.showTranslateOptions(visitorChat, language);
    }
    else
    {
        var noGTranslateKeyWarning1 = t('LiveZilla can translate your conversations in real time. This is based upon Google Translate.');
        var noGTranslateKeyWarning2 = t('To use this functionality, you have to add a Google API key.');
        var noGTranslateKeyWarning3 = t('For further information, see LiveZilla Server Admin -> LiveZilla Server Configuration.');
        var noGTranslateKeyWarning = t('<!--phrase1--><br /><br /><!--phrase2--><br /><!--phrase3-->',
            [['<!--phrase1-->', noGTranslateKeyWarning1], ['<!--phrase2-->', noGTranslateKeyWarning2], ['<!--phrase3-->', noGTranslateKeyWarning3]]);
        lzm_commonDialog.createAlertDialog(noGTranslateKeyWarning, [{id: 'ok', name: t('Ok')}]);
        $('#alert-btn-ok').click(function() {
            lzm_commonDialog.removeAlertDialog();
        });
    }
}

function SendTranslatedChat(chatMessage, _activeChatId) {

    ChatEditorClass.ExpandChatInputOffset = 0;

    chatMessage = (typeof chatMessage != 'undefined') ? chatMessage : grabEditorContents();
    _activeChatId = (typeof _activeChatId != 'undefined' && _activeChatId != '') ? _activeChatId : (typeof ChatManager.ActiveChat != 'undefined' && ChatManager.ActiveChat != '') ? ChatManager.ActiveChat : ChatManager.LastActiveChat;

    var chatObj = DataEngine.ChatManager.GetChat(_activeChatId);
    var chatFullId = chatObj.GetFullId();

    if (DataEngine.otrs != '' &&
        DataEngine.otrs != null &&
        d(lzm_chatDisplay.chatTranslations[chatFullId]) &&
        lzm_chatDisplay.chatTranslations[chatFullId].tmm != null &&
        lzm_chatDisplay.chatTranslations[chatFullId].tmm.translate &&
        lzm_chatDisplay.chatTranslations[chatFullId].tmm.sourceLanguage != lzm_chatDisplay.chatTranslations[chatFullId].tmm.targetLanguage) {
        UserActions.TranslateTextAndSend(chatFullId, chatMessage, _activeChatId);
    }
    else
        SendChat(chatMessage, _activeChatId);
}

function SendChat(chatMessage, activeChatId, translatedChatMessage) {

    ChatEditorClass.ExpandChatInputOffset = 0;

    translatedChatMessage = (typeof translatedChatMessage != 'undefined') ? translatedChatMessage : '';

    var chatobj = DataEngine.ChatManager.GetChat(activeChatId);
    if (chatobj != null)
    {
        UserActions.deleteChatInput(activeChatId);
        chatobj.IsUnread = false;

        chatMessage = (typeof chatMessage != 'undefined' && chatMessage != '') ? chatMessage : grabEditorContents();
        if (chatMessage != '')
        {
            if(chatMessage.indexOf('/')===0 && chatMessage.length > 1)
                return;

            CommunicationEngine.typingChatPartner = '';

            var new_chat = {};
            new_chat.id = md5(String(Math.random())).substr(0, 32);
            new_chat.rp = '';
            new_chat.sen = DataEngine.myId;
            new_chat.rec = '';
            new_chat.reco = activeChatId;

            var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
            new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
            new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', lzm_chatDisplay.userLanguage);
            new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', lzm_chatDisplay.userLanguage);
            var chatText = chatMessage.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, "<br />");

            if(!UserActions.messageFromKnowledgebase || chatText.indexOf('<a')==-1)
            {
                chatText = chatText.replace(/<script/g,'&lt;script').replace(/<\/script/g,'&lt;/script');
                chatText = lzm_commonTools.addLinksToChatInput(chatText);
            }

            new_chat.text = lzm_commonTools.replaceChatPlaceholders(activeChatId, chatText);
            if (translatedChatMessage != '')
            {
                var translatedText = translatedChatMessage.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, "<br />");
                translatedText = translatedText.replace(/<script/g,'&lt;script').replace(/<\/script/g,'&lt;/script');
                translatedText = lzm_commonTools.addLinksToChatInput(translatedText);
                new_chat.tr = translatedText;
            }

            if (activeChatId == ChatManager.ActiveChat)
                clearEditorContents('', lzm_chatDisplay.browserName, 'send');

            chatobj.AddMessage(new_chat);
            UserActions.sendChatMessage(new_chat, translatedChatMessage, chatobj.GetFullId());

            if (activeChatId == ChatManager.ActiveChat)
            {
                lzm_chatDisplay.DrawChat();
                lzm_chatDisplay.createViewSelectPanel();
                lzm_chatDisplay.createChatWindowLayout(true);
            }
        }
    }
    else
        inviteExternalUser(lzm_chatDisplay.thisUser.id, lzm_chatDisplay.thisUser.b_id);
}

function showAllchatsList(userAction) {
    userAction = (typeof userAction != 'undefined') ? userAction : false;
    if (userAction)
    {
        if (ChatManager.ActiveChat != 'LIST')
        {
            UserActions.saveChatInput(ChatManager.ActiveChat);
            removeEditor();
        }

        DataEngine.ChatManager.SetActiveChat('LIST');
        $('#chat-allchats').css({'display': 'block'});

    }
    else if (ChatManager.ActiveChat == 'LIST')
        $('#chat-allchats').css({'display': 'block'});

    lzm_chatDisplay.ChatsUI.UpdateChatList();
    lzm_chatDisplay.DrawChatElements();
    lzm_chatDisplay.UpdateTabsUI();

}

function hideAllchatsList() {
    $('#chat-allchats').css({'display': 'none'});
}

function switchObserverMode(){
    lzm_chatDisplay.ChatsUI.ObserverMode = !lzm_chatDisplay.ChatsUI.ObserverMode;
    lzm_commonStorage.saveValue('observer_mode_' + DataEngine.myId,(lzm_chatDisplay.ChatsUI.ObserverMode) ? 1 : 0);

    if(lzm_chatDisplay.ChatsUI.ObserverMode)
        $('#allchats-observer-mode').addClass('lzm-button-b-pushed');
    else
        $('#allchats-observer-mode').removeClass('lzm-button-b-pushed');

    UIRenderer.resizeAllChats();
}

function toggleMemberList(){
    if($.inArray(ChatManager.ActiveChat,lzm_chatDisplay.minimizedMemberLists)==-1)
        lzm_chatDisplay.minimizedMemberLists.push(ChatManager.ActiveChat);
    else
        lzm_chatDisplay.minimizedMemberLists.splice($.inArray(ChatManager.ActiveChat, lzm_chatDisplay.minimizedMemberLists), 1 );
    lzm_chatDisplay.DrawChatElements();
}

function openChatLineContextMenu(chatId,e) {

    if($('#all-chats-group-'+chatId).length)
        ChatUI.__TreeClick('all-chats-group-'+chatId);
    else
        ChatUI.__RowClick(this,chatId);

    var scrolledDownY, scrolledDownX, parentOffset, place = 'chat-allchats';
    scrolledDownY = $('#' + place).scrollTop();
    scrolledDownX = $('#' + place).scrollLeft();
    parentOffset = $('#' + place).offset();

    var xValue = e.pageX - parentOffset.left + scrolledDownX;
    var yValue = e.pageY - parentOffset.top + scrolledDownY;

    chatId = chatId.replace('-my','');
    var chat = DataEngine.ChatManager.GetChat(chatId,'i');

    if(chat==null)
    {
        chat = new Chat();
        chat.SystemId = chatId;
        chat.Type = Chat.ChatGroup;
    }

    lzm_chatDisplay.showContextMenu(place, chat, xValue, yValue);
    e.stopPropagation();
    e.preventDefault();
}

function removeChatLineContextMenu() {
    $('#chat-allchats-context').remove();
}

function addJoinedMessageToChat(activeChatId, visitorName, groupName) {

    groupName = (typeof groupName != 'undefined') ? groupName : '';
    var chatText = (groupName != '') ? t('<!--vis_name--> joins <!--group_name-->.',[['<!--vis_name-->', visitorName], ['<!--group_name-->', groupName]]) : t('<!--vis_name--> joins the chat.',[['<!--vis_name-->', visitorName]]);
    var new_chat = {};
    new_chat.id = md5(String(Math.random())).substr(0, 32);
    new_chat.rp = '';
    new_chat.sen = '0000000';
    new_chat.rec = '';
    new_chat.reco = activeChatId;
    var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
    new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
    new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', lzm_chatDisplay.userLanguage);
    new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', lzm_chatDisplay.userLanguage);
    new_chat.text = chatText;
    DataEngine.ChatManager.GetChat(activeChatId).AddMessage(new_chat);
}

function addLeftMessageToChat(_chatObj, visitorName, groupName) {
    groupName = (typeof groupName != 'undefined') ? groupName : '';
    var chatText = (groupName != '') ? t('<!--vis_name--> has left <!--group_name-->.',[['<!--vis_name-->', visitorName], ['<!--group_name-->', groupName]]) : tid('visitor_left',[['<!--vis_name-->', visitorName]]);
    var new_chat = {};
    new_chat.id = md5(String(Math.random())).substr(0, 32);
    new_chat.rp = '';
    new_chat.sen = '0000000';
    new_chat.rec = '';
    new_chat.reco = _chatObj.SystemId;
    var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
    new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
    new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', lzm_chatDisplay.userLanguage);
    new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', lzm_chatDisplay.userLanguage);
    new_chat.text = chatText;
    _chatObj.AddMessage(new_chat);
}

function addOperatorLeftMessageToChat(_chatObj, membersLeft) {
    var i,goneMessages = [];
    for (i=0; i<membersLeft.length; i++)
    {
        if(membersLeft[i] != null)
        {
            var operator = DataEngine.operators.getOperator(membersLeft[i].i);
            if (operator != null)
            {
                var new_chat = {};
                new_chat.id = md5(String(Math.random())).substr(0, 32);
                new_chat.rp = '';
                new_chat.sen = '0000000';
                new_chat.rec = '';
                new_chat.reco = _chatObj.SystemId;

                var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
                new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
                new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', lzm_chatDisplay.userLanguage);
                new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', lzm_chatDisplay.userLanguage);
                new_chat.text = tid('op_has_left').replace('<!--this_op_name-->', operator.name);
                goneMessages.push(new_chat);
            }
        }
    }

    if(goneMessages.length < 3)
        for (i=0; i<goneMessages.length; i++)
            _chatObj.AddMessage(goneMessages[i]);
}

function addAcceptedMessageToChat(_chat){

    var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
    if(_chat != null && _chat.Members.length)
    {
        var host = _chat.Members[0];
        var operator = DataEngine.operators.getOperator(host.i);
        var opName = (operator != null) ? operator.name : t('Another operator');
        var new_chat = {};
        new_chat.id = md5(String(Math.random())).substr(0, 32);
        new_chat.rp = '';
        new_chat.sen = '0000000';
        new_chat.rec = '';
        new_chat.reco = chat;
        new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
        new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', lzm_chatDisplay.userLanguage);
        new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', lzm_chatDisplay.userLanguage);
        new_chat.text = t('<!--this_op_name--> has accepted the chat.', [['<!--this_op_name-->',opName]]);
        _chat.AddMessage(new_chat);
    }
}

function addOperatorJoinedMessageToChat(_chatObj, newMembers) {
    for (var i=0; i<newMembers.length; i++)
    {
        var operator = DataEngine.operators.getOperator(newMembers[i]);
        if (operator != null)
        {
            var new_chat = {};
            new_chat.id = md5(String(Math.random())).substr(0, 32);
            new_chat.rp = '';
            new_chat.sen = '0000000';
            new_chat.rec = '';
            new_chat.reco = _chatObj.SystemId;

            var tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
            new_chat.date = lzm_chatTimeStamp.getServerTimeString(tmpdate, true);
            new_chat.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', lzm_chatDisplay.userLanguage);
            new_chat.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', lzm_chatDisplay.userLanguage);
            new_chat.text = tid('op_joined_chat').replace('<!--this_op_name-->',operator.name);
            _chatObj.AddMessage(new_chat);
        }
    }
}

function addChatInfoBlock(_chat,_openTab) {

    if (_chat.Visitor != null)
    {
        var ikey,val,inputText,tmpDate = lzm_chatTimeStamp.getLocalTimeObject(_chat.f * 1000, true);
        var tUoperators='',operators = DataEngine.operators.getOperatorList();
        for (var i=0; i<operators.length; i++)
            if (_chat.IsMember(operators[i].id) && !_chat.IsHiddenMember(operators[i].id))
                tUoperators +=  operators[i].name + ', ';

        tUoperators = tUoperators.replace(/, *$/,'');

        var name = DataEngine.inputList.getInputValueFromVisitor(111,_chat.Visitor);
        var websiteNames = '',customFields = '';

        if(_chat.Visitor.d != null)
        {
            websiteNames = VisitorManager.GetWebsiteNames(_chat.Visitor);
            for (var key in _chat.Visitor.d)
            {
                var input = DataEngine.inputList.getCustomInput(key);
                if(input != null)
                {
                    val = DataEngine.inputList.getInputValueFromVisitor(key,_chat.Visitor);

                    try
                    {
                        inputText = (input.type != 'CheckBox') ? val : (val.toString() == '1') ? t('Yes') : t('No');
                        if(input.type == 'ComboBox')
                            inputText = input.value[parseInt(val)];
                    }
                    catch(ex)
                    {
                        deblog(ex);
                    }

                    ikey = DataEngine.inputList.getCustomInput(key).name;
                    if(!lzm_commonTools.endsWith(ikey, ':'))
                        ikey += ':';

                    if(d(inputText) && inputText.length)
                        customFields += '<tr><td style="vertical-align: top;">' + ikey  + '</td><td>' + inputText + '</td></tr>';
                }
            }
        }

        var chatUrl = '';
        try
        {
            if(_chat.Browser != null)
            {
                var bobj = _chat.Browser;
                if(d(bobj) && d(bobj.h2))
                {

                    chatUrl = (bobj.h2.length > 0 && bobj.h2[bobj.h2.length - 1].url != '') ? bobj.h2[bobj.h2.length - 1].url : '';

                    if (bobj.h2.length == 0)
                    {
                        var lastOpened = 0;
                        for (var k=0; k<_chat.Browser[0].b.length; k++)
                        {
                            if (_chat.Browser[0].b[k].h2.length > 0 && _chat.Browser[0].b[k].h2[_chat.Browser[0].b[k].h2.length - 1].time > lastOpened && _chat.Browser[0].b[k].chat.id == '') {
                                chatUrl = (_chat.Browser[0].b[k].h2[_chat.Browser[0].b[k].h2.length - 1].url != '') ? _chat.Browser[0].b[k].h2[_chat.Browser[0].b[k].h2.length - 1].url : '';
                                lastOpened = _chat.Browser[0].b[k].h2[_chat.Browser[0].b[k].h2.length - 1].time;
                            }
                        }
                    }
                }
            }
        }
        catch (ex)
        {
            deblog(ex);
        }
        var new_chat = {
            date: _chat.f-5,
            m: 0,
            cmc: DataEngine.chatMessageCounter,
            id : md5(String(Math.random())).substr(0, 32),
            rec: _chat.v + '~' + _chat.b,
            reco: DataEngine.myId,
            rp: '0',
            sen: _chat.v + '~' + _chat.b,
            sen_id: _chat.v,
            sen_b_id: _chat.b,
            text: '',
            date_human: lzm_commonTools.getHumanDate(tmpDate, 'date', lzm_chatDisplay.userLanguage),
            time_human: lzm_commonTools.getHumanDate(tmpDate, 'time', lzm_chatDisplay.userLanguage),
            info_header: {
                group: _chat.dcg,
                operators: tUoperators,
                name: name,
                mail: DataEngine.inputList.getInputValueFromVisitor(112,_chat.Visitor),
                company: DataEngine.inputList.getInputValueFromVisitor(113,_chat.Visitor),
                phone: DataEngine.inputList.getInputValueFromVisitor(116,_chat.Visitor),
                question: _chat.s,
                chat_id: _chat.i,
                area_code: websiteNames,
                url: chatUrl,
                cf: customFields
            }
        };

        _chat.AddMessage(new_chat,_openTab);
    }
}

function isAutoAcceptActive () {
    return (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'chats', 'must_auto_accept', {}) ||
        (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'chats', 'can_auto_accept', {}) && LocalConfiguration.ChatAutoAccept));
}

function openChatFromNotification(chatPartner, type) {

    type = (typeof type != 'undefined') ? type : '';
    SelectView('mychats');
    if (typeof chatPartner != 'undefined' && chatPartner != '')
    {
        lzm_chatDisplay.lastChatSendingNotification = chatPartner;
    }
    if (lzm_chatDisplay.lastChatSendingNotification != '')
    {
        OpenChatTabById('notification');
    }
    if (type == 'push')
        showAppIsSyncing();
}

function AcceptChat(_systemId){
    var _chatObj = DataEngine.ChatManager.GetChat(_systemId);
    UserActions.AcceptChat(_chatObj,true);
    OpenChatTab(_systemId);
}

function declineChat(id, b_id, chat_id){
    UserActions.declineChat(id, b_id, chat_id);
}

function OpenChatTabById(id) {

    var chatToOpen = '';
    if (id == 'notification')
        chatToOpen = lzm_chatDisplay.lastChatSendingNotification;
    else if (id == 'panel' && lzm_chatDisplay.lastChatSendingNotification != '')
        chatToOpen = lzm_chatDisplay.lastChatSendingNotification;
    else
        chatToOpen = id;

    lzm_chatDisplay.lastChatSendingNotification = '';

    var but = $('#chat-button-'+chatToOpen);
    if(but.length)
        $('#chat-button-'+chatToOpen).click();
    else if(chatToOpen.indexOf('~')!=-1)
        OpenChatTab(chatToOpen);

}

function OpenChatTab(_systemId){

    var chat = DataEngine.ChatManager.GetChat(_systemId);
    if(chat != null && chat.Type == Chat.Visitor)
    {
        var cg = chat.GetChatGroup();
        if(cg != null)
        {
            OpenChatTab(cg.id);
            return;
        }
        showVisitorChat(chat.v, chat.b, chat.i, true);
    }
    else
    {
        var operator = DataEngine.operators.getOperator(_systemId);
        var group = DataEngine.groups.getGroup(_systemId);
        if(operator != null || group != null || 'everyoneintern' == _systemId)
            chatInternalWith(_systemId);
    }
    if(!CommonUIClass.BlockUIUpdate)
        lzm_chatDisplay.DrawChat();

    // FIND open chat tab
    if(IFManager.IsDesktopApp() && typeof(window.top.SpellCheck) != 'undefined'){
        window.top.SpellCheck.SetLanguageFromChat(chat);
    }
}

function CloseChatTabById(_systemId,_event){
    _event.stopPropagation();
    OpenChatTab(_systemId);
    CloseActiveChatTab();
}

function CloseActiveChatTab(){

    var toCChat = DataEngine.ChatManager.GetChat(ChatManager.ActiveChat,'SystemId');
    DataEngine.ChatManager.CloseChatTab(ChatManager.ActiveChat);

    if (toCChat == null)
        UserActions.leaveInternalChat(lzm_chatDisplay.thisUser.id, lzm_chatDisplay.thisUser.userid, lzm_chatDisplay.thisUser.name, openNext);

    if(!CommonUIClass.BlockUIUpdate)
        SelectNextTabInRow(ChatManager.ActiveChat);
}

function leaveChat(_chatId) {

    _chatId = (d(_chatId)) ? _chatId : null;

    var activeChatObj = (_chatId!=null) ? DataEngine.ChatManager.GetChat(_chatId,'i') : DataEngine.ChatManager.GetChat();

    if (activeChatObj != null)
    {
        var chatServerAccepted = activeChatObj.IsAccepted();
        var chatLocalAccepted = activeChatObj.IsAccepted();
        var chatDeclined = activeChatObj.IsDeclined();
        var lastOperator = activeChatObj.GetOperatorsLeft().length==1;
        var iHost = activeChatObj.IsHost(DataEngine.myId);
        var chatHasEnded = activeChatObj.GetStatus() != Chat.Closed;
        var closeOrLeave = ((iHost && lastOperator) || chatDeclined) ? 'close' : 'leave';

        if(!chatLocalAccepted && !chatServerAccepted && !chatHasEnded && !chatDeclined)
            UserActions.declineChat(activeChatObj.v, activeChatObj.b, activeChatObj.i);
        else if (chatDeclined)
        {

        }
        else if (chatHasEnded || !iHost || !lastOperator)
            UserActions.leaveExternalChat(activeChatObj.v, activeChatObj.b, activeChatObj.i, 0, closeOrLeave);
        else
        {
            lzm_commonDialog.createAlertDialog(tid('close_confirm'), [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
            $('#alert-btn-ok').click(function()
            {
                UserActions.leaveExternalChat(activeChatObj.v, activeChatObj.b, activeChatObj.i, 0, closeOrLeave);
                $('#alert-btn-cancel').click();
            });
            $('#alert-btn-cancel').click(function()
            {
                lzm_commonDialog.removeAlertDialog();
            });
        }
    }
}

function closeChat(chatId, visitorId, browserId, avoidReAppearanceOnClose){
    this.CommunicationEngine.stopPolling();
    this.CommunicationEngine.addToOutboundQueue('p_ca_0_va', visitorId, 'nonumber');
    this.CommunicationEngine.addToOutboundQueue('p_ca_0_vb', browserId, 'nonumber');
    this.CommunicationEngine.addToOutboundQueue('p_ca_0_vc', chatId, 'nonumber');
    this.CommunicationEngine.addToOutboundQueue('p_ca_0_vd', 'CloseChat', 'nonumber');
    this.CommunicationEngine.pollServer(this.CommunicationEngine.fillDataObject(), 'shout');
    if(avoidReAppearanceOnClose)
        lzm_chatDisplay.hiddenChats[chatId] = chatId;
}

function closeAllInactiveChats(){
    var toClose = [];
    $('#active-chat-panel div').each(function(){
        $(this).find('span').each(function(){
            if($(this).hasClass('lzm-tab-icon-content'))
                if($(this).attr('style').indexOf('lz_offline.png') != -1)
                    toClose.push($(this).parent().attr('id'));
        });
    });

    CommonUIClass.BlockUIUpdate = true;
    for(var key in toClose)
    {
        $('#' + toClose[key]).click();
        CloseActiveChatTab(false);
    }
    CommonUIClass.BlockUIUpdate = false;
    showAllchatsList(true);
}

function SelectNextTabInRow(notthis) {
    var toSelect = 'show-allchats-list',newSelect='';
    $('#active-chat-panel div').each(function(){
        var child = $(this);
        if(child.attr('id').indexOf('chat-button-')===0 && !child.hasClass('lzm-tabs-selected'))
        {
            newSelect = child.attr('id');//.replace('chat-button-','');
            if(newSelect != notthis)
                toSelect = newSelect;
        }
    });

    $('#'+toSelect).click();
    return toSelect;
}

function takeChat(visitorId, browserId, chatId, groupId, askBeforeTake) {

    askBeforeTake = true;

    var mayTake = lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'chats', 'take_over', null),taken=false;
    askBeforeTake = (typeof askBeforeTake != 'undefined') ? askBeforeTake : false;
    removeChatLineContextMenu();

    var chatObj = DataEngine.ChatManager.GetChat(chatId,'i');
    var isBotChat = chatObj.IsBotChat();
    var member = chatObj.GetMember(DataEngine.myId);
    var hasDeclined = member != null && member.d=='1';

    if (member != null && !hasDeclined)
    {
        OpenChatTab(chatObj.SystemId);
    }
    else
    {
        var activate = false;
        if (!mayTake)
            showNoPermissionMessage();
        else if (chatObj.GetStatus() != Chat.Active || isBotChat)
        {
            groupId = ($.inArray(groupId, lzm_chatDisplay.myGroups) != -1) ? groupId : lzm_chatDisplay.myGroups[0];

            if (askBeforeTake)
            {
                var errorMessage = t('Do you want to take this chat?');
                lzm_commonDialog.createAlertDialog(errorMessage, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
                $('#alert-btn-ok').click(function() {
                    CommunicationEngine.pollServerSpecial({v: visitorId, b: browserId, c: chatId, g: groupId, o: DataEngine.myId,a:activate}, 'take-chat');
                    lzm_commonDialog.removeAlertDialog();
                    taken = true;
                });
                $('#alert-btn-cancel').click(function() {
                    lzm_commonDialog.removeAlertDialog();
                });
            }
            else
            {
                CommunicationEngine.pollServerSpecial({v: visitorId, b: browserId, c: chatId, g: groupId, o: DataEngine.myId,a:activate}, 'take-chat');
                taken = true;
            }
        }
        else if (chatObj.GetStatus() == Chat.Active)
        {
            if (askBeforeTake)
            {
                var errorMessage = t('Do you want to take this chat?');
                lzm_commonDialog.createAlertDialog(errorMessage, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
                $('#alert-btn-ok').click(function() {
                    CommunicationEngine.pollServerSpecial({v: chatObj.v, b: chatObj.b, c: chatObj.i, g: groupId, o: DataEngine.myId,a:activate}, 'take-chat');
                    lzm_commonDialog.removeAlertDialog();
                    taken = true;
                });
                $('#alert-btn-cancel').click(function() {
                    lzm_commonDialog.removeAlertDialog();
                });
            }
            else
            {
                CommunicationEngine.pollServerSpecial({v: chatObj.v, b: chatObj.b, c: chatObj.i, g: groupId, o: DataEngine.myId,a:activate}, 'take-chat');
                taken = true;
            }
        }
    }

    if(taken)
        DataEngine.ChatManager.OpenChatTab(visitorId + '~' + browserId);

}

function JoinChat(visitorId, browserId, chatId, joinInvisible, joinAfterInvitation) {
    joinInvisible = (typeof joinInvisible != 'undefined') ? joinInvisible : false;
    joinAfterInvitation = (typeof joinAfterInvitation != 'undefined') ? joinAfterInvitation : false;

    if (!lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'chats', 'join', {}))
        showNoPermissionMessage();
    else
    {
        DataEngine.ChatManager.OpenChatTab(visitorId + '~' + browserId);
        lzm_commonTools.RemoveFromArray(lzm_chatDisplay.joinedChats,visitorId + '~' + browserId);
        lzm_chatDisplay.joinedChats.push(visitorId + '~' + browserId);

        if (joinInvisible)
        {
            if (!lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'chats', 'join_invisible', {}))
                showNoPermissionMessage();
            else
                CommunicationEngine.pollServerSpecial({v: visitorId, b: browserId, c: chatId}, 'join-chat-invisible');
        }
        else if (joinAfterInvitation)
            CommunicationEngine.pollServerSpecial({v: visitorId, b: browserId, c: chatId}, 'join-chat');
        else
        {
            if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'chats', 'join_after_invitation', {}))
                showNoPermissionMessage();
            else
                CommunicationEngine.pollServerSpecial({v: visitorId, b: browserId, c: chatId}, 'join-chat');
        }
    }
}

function enableChatButtons() {
    $('.disabled-chat-button').removeClass('ui-disabled');
    $('.disabled-chat-button').removeClass('disabled-chat-button');
}

function forwardChat(chatId, type) {
    LoadModuleConfiguration('ChatForwardInvite','lzm_chatDisplay.ChatForwardInvite.showForwardInvite(\''+chatId+'\',\''+type+'\');');
}

function showInvitedMessage(_chatId,senderId,_text) {

    var chatObj = DataEngine.ChatManager.GetChat(_chatId,'i');
    var op = DataEngine.operators.getOperator(senderId);
    if (chatObj != null && op != null && !lzm_chatDisplay.showOpInviteDialog)
    {
        lzm_chatDisplay.showOpInviteDialog = true;
        var visName = chatObj.GetName();
        visName = lzm_commonTools.escapeHtml(visName);
        var errorMessage = tid('invite_join',[['<!--op_name-->', op.name], ['<!--visitor_name-->', visName]]);
        errorMessage += tidc('addition_info_given','.') + '<br />';
        errorMessage +='<div id="add-info-box" class="top-space border-s" style="height:50px; overflow-y: auto; padding: 5px; font-style: italic;">' + _text + '</div>';
        lzm_commonDialog.createAlertDialog(errorMessage, [{id: 'join', name: t('Join Chat')}, {id: 'decline', name: t('Decline')}]);
        $('#alert-btn-join').click(function() {

            JoinChat(chatObj.v, chatObj.b, chatObj.i, false, true);
            SelectView('mychats');
            OpenChatTab(chatObj.SystemId);

            lzm_chatDisplay.showOpInviteDialog = false;
            lzm_commonDialog.removeAlertDialog();
        });
        $('#alert-btn-decline').click(function() {
            lzm_chatDisplay.showOpInviteDialog = false;
            lzm_commonDialog.removeAlertDialog();
        });
    }
}

function showVisitorChatActionContextMenu(activeChatId, button, e) {
    e.stopPropagation();
    if (button == 'panel')
    {
        e.preventDefault();
    }
    if (lzm_chatDisplay.showChatActionsMenu)
    {
        removeVisitorChatActionContextMenu();
    }
    else
    {
        lzm_chatDisplay.showChatActionsMenu = true;
        var userChat = DataEngine.ChatManager.GetChat(activeChatId);
        userChat.button = button;
        var parentOffset = $('#chat-container').offset();
        var xValue, yValue;
        if (button == 'actions')
        {
            var buttonOffset = $('#visitor-chat-actions').offset();
            xValue = buttonOffset.left - parentOffset.left - 1;
            yValue = e.pageY - parentOffset.top;
        }
        else
        {
            xValue = e.pageX - parentOffset.left;
            yValue = e.pageY - parentOffset.top;
        }

        lzm_chatDisplay.showContextMenu('chat-actions', userChat, xValue, yValue, 'chat-actions');
    }
}

function removeVisitorChatActionContextMenu() {
    lzm_chatDisplay.showChatActionsMenu = false;

    $('#chat-actions-context').remove();
}

function handleAllChatsTree(){

    lzm_chatDisplay.ChatsUI.CategorySelect = !lzm_chatDisplay.ChatsUI.CategorySelect;
    UIRenderer.resizeAllChats();
}

/**************************************** Operator settings ****************************************/
function setUserStatus(statusValue, e) {
    if(e!=null)
        e.stopPropagation();
    var previousStatusValue = ChatPollServerClass.__UserStatus;
    lzm_chatDisplay.setUserStatus(statusValue);

    if (statusValue != 2 && previousStatusValue != 2 && statusValue != previousStatusValue)
        CommunicationEngine.startPolling();

    IFManager.IFSetOperatorStatus(statusValue);
}

function manageUsersettings(e) {
    e.stopPropagation();
    saveChatInput(ChatManager.ActiveChat);
    var storedSettingsId = '';
    for (var key in lzm_chatDisplay.StoredDialogs) {
        if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
            if (lzm_chatDisplay.StoredDialogs[key].type == 'settings') {
                storedSettingsId = key;
            }
        }
    }

    if (storedSettingsId != '')
        lzm_displayHelper.maximizeDialogWindow(storedSettingsId);
    else
        lzm_chatDisplay.settingsDisplay.manageUsersettings();
}

function changeTableRow(e,type,tableId,tableIndex,rowId,direction){
    e.stopPropagation();
    lzm_chatDisplay.settingsDisplay.changeTableRow(type,tableId,tableIndex,rowId,direction);
}

function saveUserSettings(saveTables) {
    var firstVisibleView = null;
    var showViewSelectPanel = {
        'home': $('#show-home').prop('checked') ? 1 : 0,
        'mychats': $('#show-mychats').prop('checked') ? 1 : 0,
        'tickets': $('#show-tickets').prop('checked') ? 1 : 0,
        'external': $('#show-external').prop('checked') ? 1 : 0,
        'internal': $('#show-internal').prop('checked') ? 1 : 0,
        'qrd': $('#show-qrd').prop('checked') ? 1 : 0,
        'archive': $('#show-archive').prop('checked') ? 1 : 0,
        'reports': $('#show-reports').prop('checked') ? 1 : 0
    };
    var viewSelectArray = [], viewSelectObject = {}, i = 0, thisColumn, columnIsVisible;
    var allViewsArray = Object.keys(lzm_chatDisplay.allViewSelectEntries);
    for (i=0; i<allViewsArray.length; i++)
        viewSelectObject[allViewsArray[i]] = {name: lzm_chatDisplay.allViewSelectEntries[allViewsArray[i]].title, icon: lzm_chatDisplay.allViewSelectEntries[allViewsArray[i]].icon};

    $('.show-view-div').each(function() {
        var viewId = $(this).data('view-id');
        if (firstVisibleView == null && showViewSelectPanel[viewId] != 0) {
            firstVisibleView = viewId;
        }
        viewSelectArray.push({id: viewId, name: viewSelectObject[viewId].name, icon: viewSelectObject[viewId].icon});
    });
    lzm_chatDisplay.viewSelectArray = viewSelectArray;
    var tableColumns = null;
    if(saveTables)
    {
        LocalConfiguration.TableColumns = lzm_commonTools.clone(lzm_chatDisplay.settingsDisplay.mainTableColumns);
        var tableNames = lzm_chatDisplay.settingsDisplay.tableIds;
        tableColumns = {};
        for (var j=0; j<tableNames.length; j++) {
            tableColumns[tableNames[j]] = {general: [], custom: []};
            for (i=0; i<LocalConfiguration.TableColumns[tableNames[j]].length; i++) {
                thisColumn = LocalConfiguration.TableColumns[tableNames[j]][i];
                thisColumn.display = ($('#show-' + tableNames[j] + '-' + thisColumn.cid).prop('checked')) ? 1 : 0;
                tableColumns[tableNames[j]].general.push(thisColumn);
            }
        }
    }

    var settings = {
        volume: $('#volume-slider').val(),
        awayAfterTime: $('#away-after-time').val(),
        backgroundMode: $('#background-mode').prop('checked') ? 1 : 0,
        saveConnections: $('#save-connections').prop('checked') ? 1 : 0,
        ticketsRead: $('#tickets-read').prop('checked') ? 1 : 0,
        showViewSelectPanel: showViewSelectPanel,
        viewSelectArray: viewSelectArray,
        tableColumns: tableColumns,
        vibrateNotifications: $('#vibrate-notifications').prop('checked') ? 1 : 0,
        qrdAutoSearch: $('#qrd-auto-search').prop('checked') ? 1 : 0,
        alertNewFilter: $('#alert-new-filter').prop('checked') ? 1 : 0
    };

    LocalConfiguration.NotificationChats = $('#notification-window-chat').prop('checked') ? 1 : 0;
    LocalConfiguration.NotificationTickets = $('#notification-window-tickets').prop('checked') ? 1 : 0;
    LocalConfiguration.NotificationEmails = $('#notification-window-emails').prop('checked') ? 1 : 0;
    LocalConfiguration.NotificationOperators = $('#notification-window-operators').prop('checked') ? 1 : 0;
    LocalConfiguration.NotificationVisitors = $('#notification-window-visitors').prop('checked') ? 1 : 0;
    lzm_commonStorage.saveValue('show_chat_visitor_info_' + DataEngine.myId,$('#show-chat-visitor-info').prop('checked') ? 1 : 0);
    lzm_commonStorage.saveValue('show_missed_chats_' + DataEngine.myId,$('#show-missed-chats').prop('checked') ? 1 : 0);

    LocalConfiguration.UIShowAvatars = $('#show-avatars').prop('checked');
    LocalConfiguration.ChatAutoAccept = $('#auto-accept').prop('checked');
    LocalConfiguration.PlayQueueSound = $('#sound-chat-queue').prop('checked');
    LocalConfiguration.RepeatQueueSound = $('#sound-repeat-queue').prop('checked');
    LocalConfiguration.PlayChatSound = $('#sound-new-chat').prop('checked');
    LocalConfiguration.PlayVisitorSound = $('#sound-new-visitor').prop('checked');
    LocalConfiguration.RepeatChatSound = $('#sound-repeat-new-chat').prop('checked');
    LocalConfiguration.CheckUpdates = $('#check-for-updates').prop('checked');

    LocalConfiguration.PlayChatMessageSound = $('#sound-new-message').prop('checked');
    LocalConfiguration.PlayTicketSound = $('#sound-new-ticket').prop('checked');


	if(IFManager.IsDesktopApp())
    {
	    if($('#app-auto-start').length)
	        IFManager.IFSetAutoStart($('#app-auto-start').prop('checked'));
	        // FIND:20 setting save on button 'ok' @spellcheck
	    if($('#spellcheck-settings').length && typeof(window.top.SpellCheck) != 'undefined'){
            window.top.SpellCheck.HandleSpellCheckSettings();
		}
	}

    LocalConfiguration.NotificationFeedbacks = $('#notification-window-feedbacks').prop('checked') ? 1 : 0;
    LocalConfiguration.Save();

    UserActions.saveUserSettings(settings);
    lzm_chatDisplay.createViewSelectPanel(firstVisibleView);
    lzm_chatDisplay.VisitorsUI.ResetVisitorList(false);
    lzm_chatDisplay.ChatsUI.CreateChatList();
    if (lzm_chatDisplay.selected_view == 'mychats')
    {
        $('#chat-qrd-preview').html('');
        lzm_chatDisplay.createChatWindowLayout(true);
    }
    else if (lzm_chatDisplay.selected_view == 'tickets')
    {
        SelectView('tickets',true);
    }
}

function finishSettingsDialogue() {
    DataEngine.settingsDialogue = false;
    lzm_chatDisplay.settingsDialogue = false;
    $('#usersettings-container').css({display: 'none'});
    if (lzm_chatDisplay.selected_view == 'mychats') {
        initEditor(loadChatInput(ChatManager.ActiveChat), 'finishSettings');
    }
}

function showUserManagement(e) {
    e.stopPropagation();
    if (DataEngine.operators.getOperator(lzm_chatDisplay.myId).level == 1) {
        saveChatInput(ChatManager.ActiveChat);
        var storedSettingsId = '';
        for (var key in lzm_chatDisplay.StoredDialogs) {
            if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                if (lzm_chatDisplay.StoredDialogs[key].type == 'user-management') {
                    storedSettingsId = key;
                }
            }
        }
        if (storedSettingsId != '')
            lzm_displayHelper.maximizeDialogWindow(storedSettingsId);
        else
            lzm_chatDisplay.settingsDisplay.createUserManagement();

    }
    else
        showNoAdministratorMessage();
}

function selectLDAPElement(id){
    $('#user-management-iframe')[0].contentWindow.selectLDAPElement(id);
}

function setUserManagementTitle(newTitle) {
    if (lzm_chatDisplay.settingsDisplay.userManagementAction == 'list') {
        $('#save-usermanagement').css({visibility: 'hidden'});
        $('#cancel-usermanagement-text').html(t('Close'));
    } else {
        $('#save-usermanagement').css({visibility: 'visible'});
        $('#cancel-usermanagement-text').html(t('Cancel'));
    }
    var oldTitle = $('#user-management-dialog-headline-text').html();
    $('#user-management-dialog-headline-text').html(newTitle);
    return oldTitle;
}

function removeUserManagement() {
    lzm_displayHelper.removeDialogWindow('user-management-dialog');
}

function closeOperatorGroupConfiguration() {
    document.getElementById('user-management-iframe').contentWindow.lzm_userManagement.hideEditDialog();
    lzm_chatDisplay.settingsDisplay.userManagementAction = 'list';
    setUserManagementTitle(lzm_chatDisplay.settingsDisplay.userManagementDialogTitle);
}

function closeOperatorSignatureTextInput() {
    var umg = document.getElementById('user-management-iframe').contentWindow.lzm_userManagement;
    umg.hideInputDialog();
    lzm_chatDisplay.settingsDisplay.userManagementAction = (umg.selectedListTab == 'user') ? 'operator' : 'group';
}

function showTranslationEditor(e) {
    e.stopPropagation();
    if (DataEngine.operators.getOperator(lzm_chatDisplay.myId).level == 1) {
        saveChatInput(ChatManager.ActiveChat);
        var storedSettingsId = '';
        for (var key in lzm_chatDisplay.StoredDialogs) {
            if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                if (lzm_chatDisplay.StoredDialogs[key].type == 'translation-editor') {
                    storedSettingsId = key;
                }
            }
        }
        if (storedSettingsId != '')
            lzm_displayHelper.maximizeDialogWindow(storedSettingsId);
        else
        {
            lzm_chatDisplay.translationEditor.loadTranslationLanguages();
            if (lzm_chatDisplay.translationEditor.serverStrings.length == 0) {
                var useEn = false, useDefault = false, useBrowser = false, useShortBrowser = false;
                var trLanguages = lzm_commonTools.clone(DataEngine.translationLanguages);
                var defLang = DataEngine.defaultLanguage;
                var brLang = lzm_t.language;
                var brSLang = lzm_t.language.split('-')[0];
                for (var i=0; i<trLanguages.length; i++) {
                    useEn = (trLanguages[i].key == 'en' && trLanguages[i].m == 0) ? true : useEn;
                    useDefault = (trLanguages[i].key == defLang && trLanguages[i].m == 0) ? true : useDefault;
                    useBrowser = (trLanguages[i].key == brLang && trLanguages[i].m == 0) ? true : useBrowser;
                    useShortBrowser = (trLanguages[i].key == brSLang && trLanguages[i].m == 0) ? true : useShortBrowser;
                }
                var origStringLanguage = (useEn) ? 'en' : (useDefault) ? defLang : (useBrowser) ? brLang : (useShortBrowser) ? brSLang : (trLanguages.length > 0) ? trLanguages[0].key : '';
                showTranslationStringsLoadingDiv();
                CommunicationEngine.pollServerSpecial({l: origStringLanguage, m: 0, o: 0}, 'load-translation');
            }
        }
    }
    else
        showNoAdministratorMessage();
}

function showTranslationStringsLoadingDiv() {
    var loadingHtml = '<div id="translation-strings-loading"><div class="lz_anim_loading"></div></div>';
    $('#translation-editor-body').append(loadingHtml).trigger('create');
    var myWidth = $('#translation-editor-body').width() + 10;
    var myHeight = $('#translation-editor-body').height() + 10;
    $('#translation-strings-loading').css({position: 'absolute',left:0,top:0,bottom:0,right:0,'background-color': '#ffffff', 'background-position': 'center', 'z-index': 1000});
}

function removeTranslationStringsLoadingDiv() {
    $('#translation-strings-loading').remove();
}

function selectTranslationLine(myKey) {
    if (typeof $('#translation-string-table').data('selected-line') != 'undefined' && typeof $('#translation-string-input').val() != 'undefined') {
        var languageCode = (lzm_chatDisplay.translationEditor.selectedTranslationTab == 'mobile_client') ?
            lzm_chatDisplay.translationEditor.languageCode : 'srv-' + lzm_chatDisplay.translationEditor.languageCode;
        var languageStrings = lzm_commonTools.clone(lzm_chatDisplay.translationEditor.saveTranslations[languageCode].strings);
        var translation = $('#translation-string-input').val();
        var selectedLine = $('#translation-string-table').data('selected-line');
        for (var i=0; i<languageStrings.length; i++) {
            if (languageStrings[i].key == selectedLine) {
                if (languageStrings[i].editedValue != translation)
                {
                    lzm_chatDisplay.translationEditor.saveTranslations[languageCode].strings[i].editedValue = translation;
                    $('#save-translation-editor').removeClass('ui-disabled');
                    lzm_chatDisplay.translationEditor.saveTranslations[languageCode].edit = 1;
                }
                $('#translation-translated-string-' + selectedLine).html(translation.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
                var translationIcon = (translation != languageStrings[i].editedValue || translation != languageStrings[i].orig || languageCode == 'en' || languageCode == 'srv-en') ? '<i class="fa fa-check-circle" style="color: #73be28;"></i>' : '<i class="fa fa-warning" style="color: #e34e4e;"></i>';
                $('#translation-icon-' + languageStrings[i].key).html(translationIcon).trigger('create');
            }
        }

    }
    $('.translation-line').removeClass('selected-table-line');
    if (myKey != '')
    {
        $('#translation-line-' + myKey).addClass('selected-table-line');
        $('#translation-string-table').data('selected-line', myKey);
    }
}

function editTranslationString(myKey, e) {
    e.stopPropagation();
    selectTranslationLine(myKey);
    var languageCode = (lzm_chatDisplay.translationEditor.selectedTranslationTab == 'mobile_client') ?
        lzm_chatDisplay.translationEditor.languageCode : 'srv-' + lzm_chatDisplay.translationEditor.languageCode;
    var languageStrings = lzm_commonTools.clone(lzm_chatDisplay.translationEditor.saveTranslations[languageCode].strings);
    for (var i=0; i<languageStrings.length; i++) {
        if (languageStrings[i].key == myKey) {
            var existingTranslation = languageStrings[i].editedValue;
            var inputFieldHtml = '<input type="text" id="translation-string-input"' +
                ' onclick="doNotSelectTranslationLine(event);" onkeyup="translationEditorEnterPressed(event);"' +
                ' data-role="none" class="lzm-text-input nic" style="min-width: 0px;"/>';
            $('#translation-translated-string-' + myKey).html(inputFieldHtml).trigger('create');
            $('#translation-string-input').val(existingTranslation);
        }
    }
}

function doNotSelectTranslationLine(e) {
    e.stopPropagation();
}

function translationEditorEnterPressed(e) {
    var keyCode = (typeof e.which != 'undefined') ? e.which : e.keyCode;
    if (keyCode == 13)
        selectTranslationLine('');
}

function addTranslationLanguage(myTab) {
    lzm_chatDisplay.translationEditor.addTranslationLanguage('add', myTab);
}

function changePassword(_e,_force) {

    if(_e!=null)
    {
        _e.stopPropagation();
        saveChatInput(ChatManager.ActiveChat);
    }

    var storedSettingsId = '';
    for (var key in lzm_chatDisplay.StoredDialogs)
    {
        if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
            if (lzm_chatDisplay.StoredDialogs[key].type == 'change-password') {
                storedSettingsId = key;
            }
        }
    }
    if (storedSettingsId != '')
        lzm_displayHelper.maximizeDialogWindow(storedSettingsId);
    else
        lzm_commonDialog.changePassword('chat',null,null,_force);
}

function personalChatLink(){
    var link = DataEngine.serverProtocol + DataEngine.serverUrl.replace(':80','').replace(':443','') + '/chat.php?intid=' + lz_global_base64_url_encode(DataEngine.myUserId);
    var linkControl = lzm_inputControls.createArea('personal_chat_link', '', '', tid('per_c_link') + ':','width:300px;height:70px;');
    lzm_commonDialog.createAlertDialog(linkControl, [{id: 'ok', name: tid('ok')}],false,true,false);
    $('#personal_chat_link').val(link);
    $('#personal_chat_link').select();
    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function savePasswordChange(newPassword) {
    CommunicationEngine.pollServerSpecial({i: lzm_chatDisplay.myId, p: newPassword}, 'change-password');
}

function showUserSettingsMenu(e) {
    e.stopPropagation();
    var thisUsersettingsMenu = $('#usersettings-menu');
    if (lzm_chatDisplay.showUsersettingsHtml == false)
    {
        lzm_chatDisplay.showUsersettingsMenu();
        thisUsersettingsMenu.css({'display':'block'});
        lzm_chatDisplay.showUsersettingsHtml = true;
    }
    else
    {
        thisUsersettingsMenu.css({'display':'none'});
        lzm_chatDisplay.showUsersettingsHtml = false;
    }

    if ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
    {
        delete messageEditor;
    }

    $('#chat-invitation-container').remove();
}

function showUserStatusMenu(e) {
    e.stopPropagation();
    var thisUserstatusMenu = $('#userstatus-menu');
    if (lzm_chatDisplay.showUserstatusHtml == false)
    {
        lzm_chatDisplay.showUserstatusMenu(ChatPollServerClass.__UserStatus, DataEngine.myName,
            DataEngine.myUserId);
        thisUserstatusMenu.css({'display':'block'});
        lzm_chatDisplay.showUserstatusHtml = true;
    }
    else
    {
        thisUserstatusMenu.css({'display':'none'});
        lzm_chatDisplay.showUserstatusHtml = false;
    }

    ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
    {
        delete messageEditor;
    }
    $('#chat-invitation-container').remove();
}

/**************************************** Visitor functions ****************************************/
function showVisitorInvitation(id) {
    if (!lzm_commonPermissions.checkUserPermissions('', 'chats', 'send_invites', {}))
        showNoPermissionMessage();
    else if (CommonUIClass.IsOutsideOfOpeningHours)
        showOutsideOpeningMessage();
    else
    {
        var doShowInvitationDialog = function()
        {
            var storedInvitationId = '';
            for (var key in lzm_chatDisplay.StoredDialogs) {
                if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                    if (lzm_chatDisplay.StoredDialogs[key].type == 'visitor-invitation' &&
                        typeof lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] != 'undefined' &&
                        lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] == id) {
                        storedInvitationId = key;
                    }
                }
            }
            if (storedInvitationId != '')
            {
                lzm_displayHelper.maximizeDialogWindow(storedInvitationId);
            }
            else
            {
                var aVisitor = VisitorManager.GetVisitor(id);
                aVisitor = (aVisitor != null) ? aVisitor : {id: '', b_id: ''};
                lzm_chatDisplay.VisitorsUI.showVisitorInvitation(aVisitor);
            }
        };

        if (visitorHasNotCanceled(id))
        {
            doShowInvitationDialog();
        }
        else
        {
            var confirmText = t('This visitor has already declined an invitation.') + '<br />' + t('Invite this visitor again?');
            lzm_commonDialog.createAlertDialog(confirmText.replace(/\n/g, '<br />'), [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
            $('#alert-btn-ok').click(function() {
                doShowInvitationDialog();
                lzm_commonDialog.removeAlertDialog();
            });
            $('#alert-btn-cancel').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        }
    }
}

function startVisitorChat(id) {
    if (!lzm_commonPermissions.checkUserPermissions('', 'chats', 'start_new', {}))
        showNoPermissionMessage();
    else if (CommonUIClass.IsOutsideOfOpeningHours)
        showOutsideOpeningMessage();
    else
        CommunicationEngine.pollServerSpecial({visitorId: id, browserId: id + '_OVL'}, 'start_overlay');
}

function visitorHasNotCanceled(id) {
    var rtValue = true;
    var aVisitor = VisitorManager.GetVisitor(id);
    aVisitor = (aVisitor != null) ? aVisitor : {id: '', b_id: ''};
    if (typeof aVisitor.r != 'undefined' && aVisitor.r.length > 0) {
        for (var i=0; i< aVisitor.r.length; i++) {
            if (aVisitor.r[i].de == 1) {
                rtValue = false;
            }
        }
    }
    return rtValue;
}

function inviteExternalUser(id, b_id, text) {
    UserActions.inviteExternalUser(id, b_id, text);
}

function cancelInvitation(id) {
    var inviter = '';
    var visitor = VisitorManager.GetVisitor(id);
    try
    {
        inviter = visitor.r[0].s;
    }
    catch(e) {}

    if ((lzm_commonPermissions.checkUserPermissions('', 'chats', 'cancel_invites', {}) && lzm_commonPermissions.checkUserPermissions('', 'chats', 'cancel_invites_others', {})) ||
        (lzm_commonPermissions.checkUserPermissions('', 'chats', 'cancel_invites', {}) && (inviter == lzm_chatDisplay.myId || inviter == ''))) {
        UserActions.cancelInvitation(id);
    }
    else
        showNoPermissionMessage();
}

function selectVisitor(e, _visitorId,_scrollTo) {
    lzm_chatGeoTrackingMap.selectedVisitor = _visitorId;
    lzm_chatGeoTrackingMap.setSelection(_visitorId,true);
    ChatVisitorClass.SelectedVisitor = _visitorId;
    $('.visitor-list-line').removeClass('selected-table-line');
    $('#visitor-list-row-' + _visitorId).addClass('selected-table-line');

    if(d(_scrollTo) && _scrollTo && d(_visitorId) && _visitorId.length && $('#visitor-list-row-'+_visitorId).length)
    {
        var container = $('#visitor-list-table-div');
        var scrollTo = $('#visitor-list-row-'+_visitorId);
        container.animate({
            scrollTop: (scrollTo.offset().top - container.offset().top + container.scrollTop())
        });
    }
}

function showVisitorInfo(userId, userName,  chatId, activeTab, chatListing) {
    activeTab = (typeof activeTab != 'undefined') ? activeTab : 0;
    userName = (typeof userName != 'undefined') ? userName : '';
    chatId = (typeof chatId != 'undefined') ? chatId : '';
    chatListing = (d(chatListing)) ? chatListing : false;

    var storedDialogId = '';
    for (var key in lzm_chatDisplay.StoredDialogs) {
        if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
            if (lzm_chatDisplay.StoredDialogs[key].type == 'visitor-information' &&
                typeof lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] != 'undefined' &&
                lzm_chatDisplay.StoredDialogs[key].data['visitor-id'] == userId) {
                storedDialogId = key;
                if (typeof lzm_chatDisplay.StoredDialogs[key + '-transcript'] != 'undefined')
                    storedDialogId = key + '-transcript';
                if (typeof lzm_chatDisplay.StoredDialogs[key + '_linker'] != 'undefined')
                    storedDialogId = key + '_linker';
            }
        }
    }

    if (storedDialogId != '')
    {
        lzm_displayHelper.maximizeDialogWindow(storedDialogId);
    }
    else
    {
        var thisUser = {id: userId, unique_name: userName};

        if (d(userId))
        {
            var visitor = VisitorManager.GetVisitor(userId);
            if(visitor != null && visitor.is_active)
            {
                thisUser = visitor;
                chatListing = false;
            }
        }

        if (d(userId) && userId.length)
        {

            lzm_chatDisplay.VisitorsUI.ShowVisitorInformation(thisUser, chatId, activeTab, true, chatListing);
        }
    }
}

function addVisitorComment(visitorId, menuEntry) {
    lzm_chatDisplay.VisitorsUI.addVisitorComment(visitorId, menuEntry);
}

function pushVisitorToWebsite(visitorBrowser, url, askBeforePushing, text, group, hasTargetBlank){
    //var dialogText = t('Do you really want to forward the visitor to this url?') + '<br /><br />' + url;
    //lzm_commonDialog.createAlertDialog(dialogText, [{id: 'yes', name: t('Yes')}, {id: 'no', name: t('No')}]);
    //$('#alert-btn-yes').click(function() {
        //lzm_commonDialog.removeAlertDialog();
    /*   var browserUrlParts = url.split('://');
       var browserProtocol = browserUrlParts[0] + '://';
        browserUrlParts = (browserUrlParts.length > 1) ? browserUrlParts[1].split('/') : [''];
       var browserAddress = (browserUrlParts[0].indexOf(':') == -1) ? browserUrlParts[0] : browserUrlParts[0].split(':')[0];
        var serverAddress = browserProtocol + DataEngine.hostName;

        if (hasTargetBlank)
        {
            dialogText = t('This URL shall be opened in a new window. You cannot open new windows on visitor side.');
            lzm_commonDialog.createAlertDialog(dialogText, [{id: 'ok', name: t('Ok')}]);
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        } else if (serverAddress != browserProtocol + browserAddress)
        {
            dialogText = t('This link refers to another host. After pushing the visitor to this host, you cannot follow him any more.');
            lzm_commonDialog.createAlertDialog(dialogText, [{id: 'yes', name: t('Yes')}, {id: 'no', name: t('No')}]);
            $('#alert-btn-yes').click(function() {
                lzm_commonDialog.removeAlertDialog();
                doPush();
            });
            $('#alert-btn-no').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        } else {
            doPush();
        }
    });
    $('#alert-btn-no').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
*/

        var pushObject = {
            vid: visitorBrowser.split('~')[0],
            ask: askBeforePushing,
            url: url,
            bid: visitorBrowser.split('~')[1],
            text: text,
            gr: group
        };
        CommunicationEngine.pollServerSpecial(pushObject, 'website-push');

}

function openVisitorListContextMenu(e, visitorId, isChatting, wasDeclined, invitationStatus) {
    e.stopPropagation();
    lzm_chatGeoTrackingMap.selectedVisitor = visitorId;
    VisitorManager.SelectedVisitor = visitorId;
    $('.visitor-list-line').removeClass('selected-table-line');
    $('#visitor-list-row-' + visitorId).addClass('selected-table-line');

    var visitor = VisitorManager.GetVisitor(visitorId);
    visitor = (visitor != null) ? visitor : {};
    var invitationLogo = (invitationStatus == 'requested') ? 'img/632-skills_not.png' : 'img/632-skills.png';
    if (lzm_chatDisplay.VisitorsUI.showVisitorListContextMenu)
    {
        removeVisitorListContextMenu();
    }
    else
    {
        var scrolledDownY = $('#visitor-list-table-div').scrollTop();
        var scrolledDownX = $('#visitor-list-table-div').scrollLeft();
        var parentOffset = $('#visitor-list-table-div').offset();
        var yValue = e.pageY - parentOffset.top + scrolledDownY;
        var xValue = e.pageX - parentOffset.left + scrolledDownX;
        lzm_chatDisplay.VisitorsUI.showVisitorListContextMenu = true;
        lzm_chatDisplay.showContextMenu('visitor-list-table-div', {visitor: visitor, chatting: isChatting, declined: wasDeclined,
            status: invitationStatus, logo: invitationLogo}, xValue, yValue);
    }
    e.preventDefault();
}

function removeVisitorListContextMenu() {
    lzm_chatDisplay.VisitorsUI.showVisitorListContextMenu = false;
    $('#visitor-list-table-div-context').remove();
}

function handleVisitorCommentClick(selectedLine) {

    //var thisUser = $('#visitor-information').data('visitor');
    //var commentText = thisUser.c[selectedLine].text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br />');
    //$('#visitor-comment-list').data('selected-row', selectedLine);
    //$('.visitor-comment-line').removeClass('selected-table-line');
    //$('#visitor-comment-line-' + selectedLine).addClass('selected-table-line');
    //$('#visitor-comment-text').html('<legend>' + t('Comment') + '</legend>' + lzm_commonTools.escapeHtml(commentText));
}

function showFilterList(e) {
    if(lzm_commonPermissions.permissions.chats_create_filter!='0')
        LoadModuleConfiguration('FilterConfiguration','lzm_chatDisplay.FilterConfiguration.showFilterList();');
    else
        showNoPermissionMessage();
}

function showFilterCreation(type, visitorId, chatId, filterId, inDialog, ticketId) {
    removeTicketContextMenu();
    if(lzm_commonPermissions.permissions.chats_create_filter!='0')
        LoadModuleConfiguration('FilterConfiguration','lzm_chatDisplay.FilterConfiguration.showFilterCreationForm(\''+type+'\', \''+visitorId+'\', \''+chatId+'\', \''+filterId+'\', '+inDialog+', \''+ticketId+'\');');
    else
        showNoPermissionMessage();
}

function deleteFilter(filterId) {
    lzm_chatDisplay.FilterConfiguration.deleteFilter(filterId);
}

function saveFilter(type,filterType) {
    lzm_chatDisplay.FilterConfiguration.saveFilter(type,filterType);
}

function openFiltersListContextMenu(e, filterId) {
    lzm_chatDisplay.FilterConfiguration.openFiltersListContextMenu(e, filterId);
}

function removeFiltersListContextMenu() {
    if(lzm_chatDisplay.FilterConfiguration != null){
        lzm_chatDisplay.FilterConfiguration.showFilterListContextMenu = false;
        $('#filter-list-context').remove();
    }
}

function selectFiltersLine(e, filterId) {
    var filter = DataEngine.filters.getFilter(filterId);
    if (filter != null) {
        $('#filter-list').data('selected-filter', filterId);
        $('.filters-list-line').removeClass('selected-table-line');
        $('#filters-list-line-' + filterId).addClass('selected-table-line');
    }
}

function editVisitorDetails(visitorId,field,elementId){
    lzm_chatDisplay.VisitorsUI.editVisitorDetails(visitorId,field,elementId);
}

function emptyMissedChats(){
    lzm_chatDisplay.ChatsUI.clearMissedChats();
}

function hideMissedChats(){
    lzm_chatDisplay.ChatsUI.hideMissedChats();
}

function initLinkGenerator(e){
    if (DataEngine.operators.getOperator(lzm_chatDisplay.myId).level == 1) {
        $.getScript('js/lzm/classes/LinkGeneratorClass.js', function( data, textStatus, jqxhr ) {
            lzm_chatDisplay.LinkGenerator = new LinkGeneratorClass();
            lzm_chatDisplay.LinkGenerator.ShowLinkGenerator();
        });
    } else
        showNoAdministratorMessage();
}

function showLinkGenerator(){
    lzm_chatDisplay.LinkGenerator.ShowLinkGenerator();
}

function selectLinkGeneratorImage(type){
    $('.image-edit-btns').removeClass('ui-disabled');
    $('.image-sets-list-line').removeClass('selected-table-line');
    $('#'+type).addClass('selected-table-line');
    $('#rm-image-set-btn').removeClass('ui-disabled');
    var buttons = JSON.parse(lz_global_base64_url_decode($('#'+type).attr('data-button')));
    $('#image-online-img').css({'background-size':'contain','background-position':'center center','background-repeat': 'no-repeat','background-image':'url(data:image/'+buttons[0].imagetype+';base64,'+buttons[0].data+')'});
    $('#image-offline-img').css({'background-size':'contain','background-position':'center center','background-repeat': 'no-repeat','background-image':'url(data:image/'+buttons[1].imagetype+';base64,'+buttons[1].data+')'});
    $('#m_SelectedImageSet').val($('#'+type).attr('data-id'));
    $('#m_SelectedImageWidth').val($('#'+type).attr('data-width'));
    $('#m_SelectedImageHeight').val($('#'+type).attr('data-height'));
}

function newLinkGeneratorCode(){
    lzm_chatDisplay.LinkGenerator.CreateNewCode();
}

function deleteLinkGeneratorCode(id){
    lzm_chatDisplay.LinkGenerator.DeleteCode(id);
}

function showLinkGeneratorCode(){
    lzm_chatDisplay.LinkGenerator.ShowLinkGeneratorCode();
}

function addImageSet(type){
    var addHtml = '',b64onlup='',b64offup='',fexon='',fexoff='';
    var etype = (type.indexOf('overlay') == -1) ? 'inlay' : 'overlay';
    addHtml += lzm_inputControls.createInput('add-img-set-online', '', '', tid('image_online'), '<i class="fa fa-file-image-o"></i>', 'file', 'a');
    addHtml += lzm_inputControls.createInput('add-img-set-offline', '', '', tid('image_offline'), '<i class="fa fa-file-image-o"></i>', 'file', 'a');
    lzm_commonDialog.createAlertDialog(addHtml, [{id: 'ok', name: tid('save')},{id: 'cancel', name: tid('cancel')}]);

    $('#add-img-set-online').change(function(e) {
        var input = e.target;
        var reader = new FileReader();
        reader.onload = function(){b64onlup = (reader.result.indexOf('data') == 0) ? reader.result.split(',')[1] : reader.result;};
        reader.readAsDataURL(input.files[0]);
        fexon = input.files[0].name.split('.').pop().toLowerCase();
    });
    $('#add-img-set-offline').change(function(e) {
        var input = e.target;
        var reader = new FileReader();
        reader.onload = function(){b64offup = (reader.result.indexOf('data') == 0) ? reader.result.split(',')[1] : reader.result;};
        reader.readAsDataURL(input.files[0]);
        fexoff = input.files[0].name.split('.').pop().toLowerCase();
    });
    $('#alert-btn-ok').click(function() {
        var data = {};
        data.p_process_banners_va = b64onlup;
        data.p_process_banners_vb = fexon;
        data.p_process_banners_vc = b64offup;
        data.p_process_banners_vd = fexoff;
        data.p_process_banners_ve = lzm_chatDisplay.LinkGenerator.m_MaxImageSetId+1;
        data.p_process_banners_vf = etype;
        CommunicationEngine.pollServerDiscrete('create_image_set',data).done(function(data) {
            lzm_chatDisplay.LinkGenerator.LoadImageSets(type,lzm_chatDisplay.LinkGenerator.m_MaxImageSetId+1);
        }).fail(function(jqXHR, textStatus, errorThrown){alert(textStatus);});
        lzm_commonDialog.removeAlertDialog();
    });
    $('#alert-btn-cancel').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function removeImageSet(type){
    $('#rm-image-set-btn').addClass('ui-disabled');
    var etype = (type.indexOf('overlay') == -1) ? 'inlay' : 'overlay';
    var did = $('#image-sets-list-table .selected-table-line').attr('data-id');
    var data = {};
    data.p_process_banners_ve = did;
    data.p_process_banners_vf = etype;
    CommunicationEngine.pollServerDiscrete('delete_image_set',data).done(function(data) {
        lzm_chatDisplay.LinkGenerator.LoadImageSets(type);
    }).fail(function(jqXHR, textStatus, errorThrown){alert(textStatus);});
}

function initEventConfiguration(e){
    if(lzm_commonPermissions.permissions.events!='0')
          LoadModuleConfiguration('EventConfiguration','lzm_chatDisplay.EventConfiguration.showEventConfiguration();');
    else
        showNoPermissionMessage();
}

function selectEventsLine(e,id){
    removeEventsListContextMenu();
    var event = lzm_commonTools.GetElementByProperty(DataEngine.eventList,'id',id);
    if (event.length==1) {
        $('.events-list-line').removeClass('selected-table-line');
        $('#events-list-line-' + id).addClass('selected-table-line');
        lzm_chatDisplay.EventConfiguration.m_SelectedEvent = lzm_commonTools.clone(event[0]);
        lzm_chatDisplay.EventConfiguration.m_SelectedEventId = lzm_chatDisplay.EventConfiguration.m_SelectedEvent.id;
    }
}

function showEventCreation(type,id){
    lzm_chatDisplay.EventConfiguration.showEventCreationForm(type,id);
}

function saveEvent(id,type){
    lzm_chatDisplay.EventConfiguration.saveEvent(id);
}

function deleteEvent(id){
    lzm_chatDisplay.EventConfiguration.deleteEvent(id);
}

function showEventSubElementCreation(action,type,id){
    lzm_chatDisplay.EventConfiguration.showEventSubElementCreation(action,type,id);
}

function openEventsListContextMenu(e, eventId){
    lzm_chatDisplay.EventConfiguration.openEventsListContextMenu(e, eventId);
}

function removeEventsListContextMenu(){
    $('#events-list-context').remove();
}

function pageFeedbacksViewer(page){
    lzm_chatDisplay.FeedbacksViewer.initUpdateViewer(page);
}

function initFeedbacksConfiguration(e){
    if(lzm_commonPermissions.permissions.ratings!='0')
        LoadModuleConfiguration('FeedbacksViewer','lzm_chatDisplay.FeedbacksViewer.showFeedbacksViewer();');
    else
        showNoPermissionMessage();
    $('#main-menu-panel-tools-feedbacks').removeClass('main-menu-panel-tool-highlight');
}

function selectFeedbacksLine(e,id){
    removeEventsListContextMenu();
    var fb = lzm_commonTools.GetElementByProperty(DataEngine.feedbacksList,'i',id);
    if (fb.length==1) {
        $('.feedbacks-list-line').removeClass('selected-table-line');
        $('#feedbacks-list-line-' + id).addClass('selected-table-line');
        lzm_chatDisplay.FeedbacksViewer.m_SelectedFeedbackId = id;
    }
}

function openFeedbacksListContextMenu(e){

}

function initServerConfiguration(e){
    lzm_chatDisplay.ServerConfigurationClass = null;
    if (DataEngine.operators.getOperator(lzm_chatDisplay.myId).level == 1)
        LoadModuleConfiguration('ServerConfigurationClass','lzm_chatDisplay.ServerConfigurationClass.showServerConfiguration();');
    else
        showNoAdministratorMessage();
}

function setValidation(id){
    lzm_chatDisplay.ServerConfigurationClass.setValidation(id);
}

function resetInputFields(){
    lzm_chatDisplay.ServerConfigurationClass.resetInputFields();
}

function addLicenseKey(){
    lzm_chatDisplay.ServerConfigurationClass.addLicenseKey();
}

function configureLicense(type){
    lzm_chatDisplay.ServerConfigurationClass.configureLicense(type);
}

function ticketSubAction(action, type, id){
    lzm_chatDisplay.ServerConfigurationClass.ticketSubAction(action, type, id);
}

function feedbackAction(action, id){
    lzm_chatDisplay.ServerConfigurationClass.feedbackAction(action, id);
}

function testLDAP(){
    lzm_chatDisplay.ServerConfigurationClass.testLDAP();
}

function showLogs(){
    var logHtml = '<div id="log-view"><div id="log-list-placeholder"></div></div>';
    var logPHPHtml = '<iframe id="log-frame-php" class="log-frame" src="'+ DataEngine.getServerUrl('log.php?t=php&v='+sha256(DataEngine.token)) + '"></iframe>';
    var logSQLHtml = '<iframe id="log-frame-sql" class="log-frame" src="'+ DataEngine.getServerUrl('log.php?t=sql&v='+sha256(DataEngine.token)) + '"></iframe>';
    var logEMAILHtml = '<iframe id="log-frame-email" class="log-frame" src="'+ DataEngine.getServerUrl('log.php?t=email&v='+sha256(DataEngine.token)) + '"></iframe>';
    var logLDAPHtml = '<iframe id="log-frame-ldap" class="log-frame" src="'+ DataEngine.getServerUrl('log.php?t=ldap&v='+sha256(DataEngine.token)) + '"></iframe>';
    var logDEBUGHtml = '<iframe id="log-frame-debug" class="log-frame" src="'+ DataEngine.getServerUrl('log.php?t=debug&v='+sha256(DataEngine.token)) + '"></iframe>';
    var logClientHtml = '<textarea id="log-frame-client" class="log-frame">';
    for(var key in Client.Logs)
        logClientHtml += Client.Logs[key].toString();
    logClientHtml += '</textarea>';

    lzm_commonDialog.createAlertDialog(logHtml, [{id: 'lvdelete', name: '<i class="fa fa-trash text-white"></i>'},{id: 'lvrefresh', name: '<i class="fa fa-refresh text-white"></i>'},{id: 'lvsend', name: tid('send')},{id: 'lvok', name: tid('close')}],true,true,false);
    lzm_displayHelper.createTabControl('log-list-placeholder',[{name: 'PHP', content: logPHPHtml}, {name: 'SQL', content: logSQLHtml}, {name: 'Email', content: logEMAILHtml},  {name: 'LDAP', content: logLDAPHtml},{name: 'Debug', content: logDEBUGHtml},{name: 'Client', content: logClientHtml}]);
    $('#alert-btn-lvok').click(function() {
        $('#main-menu-panel-tools-logs i').removeClass('icon-orange');
        lzm_commonDialog.removeAlertDialog();
    });
    $('#alert-btn-lvrefresh').click(function() {
        $("#log-frame-php").attr( 'src', function ( i, val ) { return val.replace('&d=1',''); });
        $("#log-frame-sql").attr( 'src', function ( i, val ) { return val.replace('&d=1',''); });
        $("#log-frame-email").attr( 'src', function ( i, val ) { return val.replace('&d=1',''); });
        $("#log-frame-debug").attr( 'src', function ( i, val ) { return val.replace('&d=1',''); });
    });
    $('#alert-btn-lvsend').click(function()
    {
        var data = 'PHP LOG:\r\n' + $("#log-frame-php").contents().find("body").html().substr(0,5000);
        data += '\r\nSQL LOG:\r\n' + $("#log-frame-sql").contents().find("body").html().substr(0,5000);
        data += '\r\nEMAIL LOG:\r\n' + $("#log-frame-email").contents().find("body").html().substr(0,5000);
        data += '\r\nDEBUG LOG:\r\n' + $("#log-frame-debug").contents().find("body").html().substr(0,5000);
        data += '\r\nCLIENT LOG:\r\n' + $("#log-frame-client").text().substr(0,5000);
        sendFeedback(data);
    });
    $('#alert-btn-lvdelete').click(function() {

        if($('#log-list-placeholder-content-0').css('display')!='none')
            $("#log-frame-php").attr( 'src', function ( i, val ) { return val+'&d=1'; });
        if($('#log-list-placeholder-content-1').css('display')!='none')
            $("#log-frame-sql").attr( 'src', function ( i, val ) { return val+'&d=1'; });
        if($('#log-list-placeholder-content-2').css('display')!='none')
            $("#log-frame-email").attr( 'src', function ( i, val ) { return val+'&d=1'; });
        if($('#log-list-placeholder-content-3').css('display')!='none')
            $("#log-frame-debug").attr( 'src', function ( i, val ) { return val+'&d=1'; });
        if($('#log-list-placeholder-content-5').css('display')!='none')
        {
            $("#log-frame-client").text('');
            Client.Logs = [];
        }
    });

    lzm_chatDisplay.createMainMenuPanel();
}

function sendFeedback(_text){

    var myDataObject = {};
    myDataObject['exception'] = _text;
    myDataObject['build'] = lzm_commonConfig.lz_version;
    var vers = lzm_commonConfig.lz_version;
    $.ajax({
        type: "POST",
        url: "https://www.livezilla.net/com/errorreport.php?culture=&product_version=" + vers + "&type=automatic",
        data: myDataObject,
        timeout: 15000,
        dataType: 'text'
    }).done(function(data) {
        alert('Thank you for reporting this problem!');
    }).fail(function(jqXHR, textStatus, errorThrown){deblog(jqXHR);});
}

function showSubMenu(place, category, objectId, contextX, contextY, menuWidth, menuHeight) {
    lzm_chatDisplay.showSubMenu(place, category, objectId, contextX, contextY, menuWidth, menuHeight);
}

function showSuperMenu(place, category, objectId, contextX, contextY, menuWidth, menuHeight) {
    lzm_chatDisplay.showSuperMenu(place, category, objectId, contextX, contextY, menuWidth, menuHeight);
}

function SelectView(id,required) {

    required = (typeof required == 'undefined') ? false: required;

    if (id != lzm_chatDisplay.selected_view || required)
    {
        var oldSelectedView = lzm_chatDisplay.selected_view;
        lzm_chatDisplay.selected_view = id;

        lzm_displayHelper.removeBrowserNotification();

        if (oldSelectedView == 'mychats')
        {
            DataEngine.ChatManager.MarkClosedRead();
            UserActions.saveChatInput(ChatManager.ActiveChat);
            removeEditor();
        }

        if (lzm_chatDisplay.selected_view == 'internal') {
            lzm_chatDisplay.createOperatorList();
        }

        if (lzm_chatDisplay.selected_view == 'mychats')
        {
            lzm_chatDisplay.DrawChat();
            if(IFManager.IsDesktopApp() && typeof(window.top.SpellCheck) != 'undefined'){
                window.top.SpellCheck.ChatViewOpened();
            }
        }

        if (oldSelectedView == 'qrd')
        {
            cancelQrdPreview();
        }
        if (lzm_chatDisplay.selected_view == 'tickets')
        {
            lzm_chatDisplay.ticketDisplay.notifyNewTicket = false;
            lzm_chatDisplay.ticketDisplay.createTicketList(lzm_chatDisplay.ticketListTickets, DataEngine.ticketGlobalValues, CommunicationEngine.ticketPage, CommunicationEngine.ticketSort, CommunicationEngine.ticketSortDir, CommunicationEngine.ticketQuery, CommunicationEngine.ticketFilterStatus, false, '');
        }
        if (lzm_chatDisplay.selected_view == 'external')
        {
            ChatVisitorClass.__UpdateMap();
            lzm_chatDisplay.VisitorsUI.UpdateVisitorList();
        }
        if (lzm_chatDisplay.selected_view == 'archive')
        {
            if ($('#chat-archive-table').length == 0)
            {
                lzm_chatDisplay.archiveDisplay.createArchive();
            }
            else
            {
                lzm_chatDisplay.archiveDisplay.updateArchive();
            }
        }
        if (lzm_chatDisplay.selected_view == 'reports') {
            lzm_chatDisplay.reportsDisplay.createReportList();
        }

        finishSettingsDialogue();

        lzm_chatDisplay.toggleVisibility();

        if (lzm_chatDisplay.selected_view == 'qrd')
        {
            if(!lzm_chatDisplay.resourcesDisplay.IsLoading && !lzm_chatDisplay.resourcesDisplay.CacheUIValid)
                lzm_chatDisplay.resourcesDisplay.setLoading(true);

            setTimeout('lzm_chatDisplay.resourcesDisplay.createQrdTree(\'view-select-panel\', \''+ChatManager.LastActiveChat+'\')',1);
        }

        if (lzm_chatDisplay.selected_view != 'external')
        {
            if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
                delete messageEditor;
            $('#chat-invitation-container').remove();
        }

        if (lzm_chatDisplay.selected_view == 'external')
            selectVisitor(null, VisitorManager.SelectedVisitor);

        lzm_chatDisplay.lastChatSendingNotification = '';
        lzm_chatDisplay.createViewSelectPanel();
        UIRenderer.resizeAll();
    }
}

function moveViewSelectPanel(target) {
    if (target == 'left' || target == 'right') {
        try {
            for (var i=0; i<lzm_chatDisplay.viewSelectArray.length; i++) {
                var j = 0;
                if (lzm_chatDisplay.firstVisibleView == lzm_chatDisplay.viewSelectArray[i].id) {
                    if (target == 'left') {
                        target = lzm_chatDisplay.viewSelectArray[i].id;
                        for (j=i-1; j>=0; j--) {
                            if (lzm_chatDisplay.showViewSelectPanel[lzm_chatDisplay.viewSelectArray[j].id] != 0 &&
                                (DataEngine.crc3 == null || DataEngine.crc3[2] != -2)) {
                                target = lzm_chatDisplay.viewSelectArray[j].id;
                                break;
                            }
                        }
                    } else {
                        target = lzm_chatDisplay.viewSelectArray[i].id;
                        for (j=i+1; j<lzm_chatDisplay.viewSelectArray.length; j++) {
                            if (lzm_chatDisplay.showViewSelectPanel[lzm_chatDisplay.viewSelectArray[j].id] != 0 &&
                                (DataEngine.crc3 == null || DataEngine.crc3[2] != -2)) {
                                target = lzm_chatDisplay.viewSelectArray[j].id;
                                break;
                            }
                        }
                    }
                }
            }
        } catch(e) {}
    }
    lzm_chatDisplay.firstVisibleView = target;
    lzm_chatDisplay.createViewSelectPanel(target);
}

function openTicketContextMenu(e, ticketId, inDialog, elementId, row) {
    inDialog = (typeof inDialog != 'undefined') ? inDialog : false;
    removeTicketFilterMenu();
    selectTicket(ticketId, false, inDialog, elementId, row, e, true);
    var scrolledDownY, scrolledDownX, parentOffset;
    var place = (!inDialog) ? 'ticket-list' : ($('#visitor-information').length) ? 'visitor-information' : 'chat-info';

    scrolledDownY = $('#' + place +'-body').scrollTop();
    scrolledDownX = $('#' + place +'-body').scrollLeft();
    parentOffset = $('#' + place +'-body').offset();
    var xValue = e.pageX - parentOffset.left + scrolledDownX;
    var yValue = e.pageY - parentOffset.top + scrolledDownY;

    var ticket = {};
    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++) {
        if (lzm_chatDisplay.ticketListTickets[i].id == ticketId) {
            ticket = lzm_chatDisplay.ticketListTickets[i];
        }
    }
    lzm_chatDisplay.showTicketContextMenu = true;
    lzm_chatDisplay.showContextMenu(place, ticket, xValue, yValue);
    e.stopPropagation();
    e.preventDefault();
}

function switchTicketNames(){
    var fn = $('#tr-firstname').val();
    var ln = $('#tr-lastname').val();
    $('#tr-firstname').val(ln);
    $('#tr-lastname').val(fn);
}

function setTicketFilter(){
    lzm_chatDisplay.ticketDisplay.setTicketFilter();
}

function removeTicketContextMenu() {
    lzm_chatDisplay.showTicketContextMenu = false;
    $('#ticket-list-context').remove();
    $('#chat-info-context').remove();
    $('#visitor-information-context').remove();
}

function removeTicketFilterMenu() {
    //lzm_chatDisplay.showTicketFilterMenu = false;
    //$('#ticket-filter-context').remove();
}

function openTicketMessageContextMenu(e, ticketId, messageNumber, fromButton) {

    if (messageNumber != '')
        handleTicketMessageClick(ticketId, messageNumber);
    else
        messageNumber = $('#ticket-history-table').data('selected-message');

    var ticket = {}, xValue, yValue;
    var parentOffset = null;
    var buttonPressed = '';
    if(!fromButton)
    {
        parentOffset = $('#ticket-history-placeholder-content-0').offset();
        xValue = e.pageX - parentOffset.left + $('#ticket-history-placeholder-content-0').scrollLeft();
        yValue = e.pageY - parentOffset.top;
    }
    else
    {
        parentOffset = $('#ticket-details-footline').offset();
        var eltOffset = $('#ticket-actions').offset();
        xValue = eltOffset.left - parentOffset.left;
        yValue = e.pageY - parentOffset.top;
        buttonPressed = 'ticket-message-actions';
    }

    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++) {
        if (lzm_chatDisplay.ticketListTickets[i].id == ticketId) {
            ticket = lzm_chatDisplay.ticketListTickets[i];
        }
    }

    lzm_chatDisplay.showTicketMessageContextMenu = true;
    lzm_chatDisplay.showContextMenu('ticket-details', {ti: ticket, msg: messageNumber}, xValue, yValue, buttonPressed);
    e.preventDefault();
}

function removeTicketMessageContextMenu() {
    lzm_chatDisplay.showTicketMessageContextMenu = false;
    $('#ticket-details-context').remove();
}

function pageTicketList(page) {
    $('.ticket-list-page-button').addClass('ui-disabled');
    var ticketFetchTime = DataEngine.ticketFetchTime;
    DataEngine.expectTicketChanges = true;
    CommunicationEngine.stopPolling();
    CommunicationEngine.ticketPage = page;
    CommunicationEngine.resetTickets = true;
    CommunicationEngine.startPolling();
    switchTicketListPresentation(ticketFetchTime, 0);
}

function switchTicketListPresentation(ticketFetchTime, counter, ticketId) {

    var loadingHtml;
    if (counter == 0)
    {
        loadingHtml = '<div id="ticket-list-loading"><div class="lz_anim_loading"></div></div>';
        $('#ticket-list-body').append(loadingHtml).trigger('create');
        var left = ($('#ticket-list-tree').css('display')=='none') ? 0 : ($('#ticket-list-tree').width()+1)+'px';
        $('#ticket-list-loading').css({position: 'absolute', left: left, top: '0px', bottom:0,right:0,'background-color': '#ffffff', 'z-index': 1000, opacity: 1});
    }
    if (ticketFetchTime != DataEngine.ticketFetchTime || counter >= 40) {
        if (typeof ticketId != 'undefined')
            changeTicketReadStatus(ticketId, 'read', true, true);
        lzm_chatDisplay.ticketDisplay.createTicketList(DataEngine.tickets,  DataEngine.ticketGlobalValues, CommunicationEngine.ticketPage, CommunicationEngine.ticketSort, CommunicationEngine.ticketSortDir, CommunicationEngine.ticketQuery, CommunicationEngine.ticketFilterStatus,'');

    }
    else
    {
        counter++;
        var delay = (counter <= 5) ? 200 : (counter <= 11) ? 500 : 1000;
        setTimeout(function() {switchTicketListPresentation(ticketFetchTime, counter, ticketId);}, delay);
    }
}

function showTicketDetails(ticketId, fromContext, emailId, chatId, dialogId) {

    removeArchiveListContextMenu();
    var email = {id: ''}, chat = {cid: ''}, i;
    ticketId = (typeof ticketId != 'undefined') ? ticketId : lzm_chatDisplay.selectedTicketRow;
    fromContext = (typeof fromContext != 'undefined') ? fromContext : false;
    emailId = (typeof emailId != 'undefined') ? emailId : '';
    chatId = (typeof chatId != 'undefined') ? chatId : '';
    dialogId = (typeof dialogId != 'undefined') ? dialogId : '';

    if (typeof emailId != 'undefined' && emailId != '') {
        for (i=0; i<DataEngine.emails.length; i++) {
            if (DataEngine.emails[i].id == emailId) {
                email = DataEngine.emails[i];
                email['dialog-id'] = dialogId
            }
        }
    }

    if (typeof chatId != 'undefined' && chatId != '')
    {
        var chatobj = DataEngine.ChatManager.GetChat(chatId,'i');
        if(chatobj!=null)
        {
            chat = lzm_commonTools.clone(chatobj);
            chat.cid = chatId;
            chat['dialog-id'] = dialogId;
        }
        else
        {
            for (i=0; i<DataEngine.chatArchive.chats.length; i++) {
                if (DataEngine.chatArchive.chats[i].cid == chatId)
                {
                    chat = DataEngine.chatArchive.chats[i];
                    chat['dialog-id'] = dialogId;

                }
            }
        }
    }
    if (ticketId != '')
    {
        selectTicket(ticketId);
        changeTicketReadStatus(ticketId, 'read', false, true);
    }
    if (!fromContext && lzm_chatDisplay.showTicketContextMenu)
        removeTicketContextMenu();
    else
    {
        removeTicketContextMenu();
        var storedPreviewId = '';
        for (var key in lzm_chatDisplay.StoredDialogs)
        {
            if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                if (lzm_chatDisplay.StoredDialogs[key].type == 'ticket-details' &&
                    typeof lzm_chatDisplay.StoredDialogs[key].data['ticket-id'] != 'undefined' &&
                    lzm_chatDisplay.StoredDialogs[key].data['ticket-id'] == ticketId) {
                    storedPreviewId = key;
                }
            }
        }

        if (storedPreviewId != '')
            lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
        else
        {
            var isNew = (ticketId == '');
            lzm_chatDisplay.ticketDialogId[ticketId] = lzm_chatDisplay.ticketDisplay.showTicketDetails(lzm_chatDisplay.ticketDisplay.getTicketById(ticketId,true), isNew, email, chat, dialogId);
        }
    }

    if(IFManager.IsDesktopApp() && typeof(window.top.SpellCheck) != 'undefined'){
        window.top.SpellCheck.SetLanguageFromTicket(ticketId);
    }

}

function addComment(ticketId, menuEntry) {

    removeTicketMessageContextMenu();
    ticketId = (typeof ticketId != 'undefined') ? ticketId : lzm_chatDisplay.selectedTicketRow;

    var messageNo = -1;
    if($('#ticket-history-table').length)
        messageNo = $('#ticket-history-table').data('selected-message');

    var ticket = {}, message = {};
    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
    {
        if (lzm_chatDisplay.ticketListTickets[i].id == ticketId)
        {
            ticket = lzm_chatDisplay.ticketListTickets[i];

            if(messageNo==-1)
                messageNo = ticket.messages.length-1;

            message = ticket.messages[messageNo];
        }
    }
    lzm_chatDisplay.ticketDisplay.addMessageComment(ticket.id, message, menuEntry);
}

function showMessageForward(ticketId, messageNo) {
    removeTicketMessageContextMenu();
    var message = {}, ticketSender = '', group = '';
    var ticket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);

    if(ticket != null){
        message = ticket.messages[messageNo];
        ticketSender = ticket.messages[0].fn;
        group = (typeof ticket.editor != 'undefined' && ticket.editor != false) ? ticket.editor.g : ticket.gr;
        lzm_chatDisplay.ticketDisplay.showMessageForward(message, ticketId, ticketSender, group);
    }
}

function sendForwardedMessage(message, text, emailAddresses, emailSubject, ticketId, group, messageNo) {
    removeTicketMessageContextMenu();
    if (message.id == '') {
        var ticket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);
        if (ticket != null) {
            message = ticket.messages[messageNo];
            text = message.mt;
            emailAddresses = message.em;
            emailSubject = (typeof message.s != 'undefined') ? message.s : '';
            group = (typeof ticket.editor != 'undefined' && ticket.editor != false) ?
                ticket.editor.g : ticket.gr;
        }
    }
    ticket = {mid: message.id, gr: group, em: emailAddresses, su: emailSubject, text: text, id: ticketId};
    CommunicationEngine.pollServerTicket([ticket], [], 'forward-to');
}

function moveMessageToNewTicket(ticketId, messageNo) {
    removeTicketMessageContextMenu();
    var message = {};
    var ticket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);
    if (ticket != null)
        message = ticket.messages[messageNo];
    ticket = {mid: message.id, id: ticketId};
    CommunicationEngine.pollServerTicket([ticket], [], 'move-message');
}

function showTicketMsgTranslator(ticketId, msgNo) {

    ticketId = (typeof ticketId != 'undefined') ? ticketId : lzm_chatDisplay.selectedTicketRow;
    msgNo = (typeof msgNo != 'undefined') ? msgNo : -1;

    var ticket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);
    if(msgNo==-1)
        if (ticket != null)
            msgNo = ticket.messages.length - 1;

    removeTicketMessageContextMenu();
    showTranslationDialog('ticket',[ticket,msgNo]);
}

function showChatQuestionTranslator(field) {
    showTranslationDialog('chat_question',[field,$(field).data('pn')]);
}

function showTranslationDialog(type,obj){
    if (DataEngine.otrs != '' && DataEngine.otrs != null)
    {
        if(type=='ticket')
        {
            if (obj[0] != null)
                obj[0] = lzm_commonTools.clone(obj[0]);
            if (obj[0] != null && obj[0].messages.length > obj[1])
                lzm_chatDisplay.showObjectTranslator('ticket',obj);
        }
        else
        {
            if (d(obj) && d!= null)
                lzm_chatDisplay.showObjectTranslator(type,obj);
        }

    }
    else
    {
        var noGTranslateKeyWarning1 = t('LiveZilla can translate your conversations in real time. This is based upon Google Translate.');
        var noGTranslateKeyWarning2 = t('To use this functionality, you have to add a Google API key.');
        var noGTranslateKeyWarning3 = t('For further information, see LiveZilla Server Admin -> LiveZilla Server Configuration.');
        var noGTranslateKeyWarning = t('<!--phrase1--><br /><br /><!--phrase2--><br /><!--phrase3-->',
            [['<!--phrase1-->', noGTranslateKeyWarning1], ['<!--phrase2-->', noGTranslateKeyWarning2], ['<!--phrase3-->', noGTranslateKeyWarning3]]);
        lzm_commonDialog.createAlertDialog(noGTranslateKeyWarning, [{id: 'ok', name: t('Ok')}]);
        $('#alert-btn-ok').click(function() {
            lzm_commonDialog.removeAlertDialog();
        });
    }
}

function showTicketLinker(firstId, secondId, firstType, secondType, inChatDialog, elementId) {

    removeTicketMessageContextMenu();
    removeArchiveListContextMenu();
    inChatDialog = (typeof inChatDialog != 'undefined') ? inChatDialog : false;
    elementId = (typeof elementId != 'undefined') ? elementId : '';

    var maximizeInsteadOfOpen = (secondType == 'chat' && secondId != '' && !inChatDialog), storedDialogId = '';
    if (maximizeInsteadOfOpen) {
        for (var key in lzm_chatDisplay.StoredDialogs) {
            if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                if (lzm_chatDisplay.StoredDialogs[key].type == 'link-ticket' &&
                    typeof lzm_chatDisplay.StoredDialogs[key].data['cid'] != 'undefined' &&
                    lzm_chatDisplay.StoredDialogs[key].data['cid'] == secondId) {
                    storedDialogId = key;
                }
            }
        }
    }
    if (storedDialogId != '') {
        lzm_displayHelper.maximizeDialogWindow(storedDialogId);
    }
    else
    {
        var firstObject = null, secondObject = null, i = 0;
        var ticket = lzm_chatDisplay.ticketDisplay.getTicketById(firstId);

        if (firstId != '' && firstType == 'ticket')
            if (ticket != null)
                firstObject = lzm_commonTools.clone(ticket);

        if (secondId != '' && secondType == 'chat') {
            for (i=0; i<DataEngine.chatArchive.chats.length; i++) {
                if (DataEngine.chatArchive.chats[i].cid == secondId) {
                    secondObject = lzm_commonTools.clone(DataEngine.chatArchive.chats[i]);
                }
            }
        }
        else if (secondId != '' && secondType == 'ticket')
        {
            ticket = lzm_chatDisplay.ticketDisplay.getTicketById(secondId);
            if (ticket != null)
                secondObject = lzm_commonTools.clone(ticket);
        }
        if (firstObject != null || secondObject != null) {
            lzm_chatDisplay.ticketDisplay.showTicketLinker(firstObject, secondObject, firstType, secondType, inChatDialog, elementId);
        }
    }
}

function linkTicket(type, firstId, secondId) {
    CommunicationEngine.pollServerSpecial({fo: type.split('~')[0], so: type.split('~')[1], fid: firstId, sid: secondId}, 'link-ticket');
}

function selectTicket(ticketId, noUserInteraction, inDialog, elementId, row, e, rightClick) {

    lzm_chatDisplay.ticketDisplay.UpdateSearchSettings(false);
    try
    {
        row = (d(row)) ? $(row) : null;
        rightClick = (d(rightClick)) ? rightClick : false;
        e = (d(e)) ? e : null;
        noUserInteraction = (typeof noUserInteraction != 'undefined') ? noUserInteraction : false;
        inDialog = (typeof inDialog != 'undefined') ? inDialog : false;
        elementId = (typeof elementId != 'undefined') ? elementId : '';

        if(rightClick && row != null && row.hasClass('selected-table-line'))
            return;

        var userId = elementId.replace('d-','').replace('e-','');
        var ticket, i;
        if (!inDialog)
        {
            if($.inArray(ticketId, ['next', 'previous']) != -1) {
                if (lzm_chatDisplay.selectedTicketRow != '') {
                    for (var j=0; j<lzm_chatDisplay.ticketListTickets.length; j++)
                        if (lzm_chatDisplay.ticketListTickets[j].id == lzm_chatDisplay.selectedTicketRow) {
                            try {
                                ticketId = (ticketId == 'next') ?  lzm_chatDisplay.ticketListTickets[j + 1].id : lzm_chatDisplay.ticketListTickets[j - 1].id;
                            } catch(e) {
                                ticketId = lzm_chatDisplay.ticketListTickets[j].id;
                            }
                        }

                }
                else {
                    try {
                        ticketId = lzm_chatDisplay.ticketListTickets[0].id
                    } catch(ex) {
                        ticketId = '';
                    }
                }
            }

            if(ticketId == '' && lzm_chatDisplay.ticketListTickets.length > 0)
                ticketId = lzm_chatDisplay.ticketListTickets[0].id;
            else if(elementId == '' && lzm_chatDisplay.ticketListTickets.length == 0)
                ticketId = '';
        }
        else
        {
            if(ticketId == '' && lzm_chatDisplay.ticketControlTickets[userId].length > 0)
                ticketId = lzm_chatDisplay.ticketControlTickets[userId][0].id;
        }

        var isMultiLine = (!inDialog && e!=null) ? (e.shiftKey || e.ctrlKey) : false;
        var isShiftSelect = (!inDialog && e!=null) ? (e.shiftKey) : false;
        var newSelectedLine = (!inDialog && e!=null) ? row.data('line-number') : 0;
        var oldSelectedLine = lzm_chatDisplay.selectedTicketRowNo;
        var selectedLine = oldSelectedLine;

        removeTicketContextMenu(inDialog);

        if(!isMultiLine)
            $('.ticket-list-row').removeClass('selected-table-line');

        if (ticketId != '' && !noUserInteraction && ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) &&
            lzm_chatDisplay.selectedTicketRow == ticketId &&
            lzm_commonTools.checkTicketReadStatus(ticketId, lzm_chatDisplay.ticketReadArray) == -1 &&
            lzm_chatTimeStamp.getServerTimeString(null, false, 1) - ticketLineClicked >= 500) {
            changeTicketReadStatus(ticketId, 'read', false, true);

        }

        ticketLineClicked = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
        lzm_chatDisplay.selectedTicketRow = ticketId;

        for (i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
            if (lzm_chatDisplay.ticketListTickets[i].id == ticketId)
                lzm_chatDisplay.selectedTicketRowNo = i;

        ticket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);
        var previewContainer = null, messageText = '';

        if (!inDialog)
        {
            if(isShiftSelect && Math.abs(row.data('line-number')-oldSelectedLine) > 1)
            {
                if(newSelectedLine>selectedLine)
                    for(i=selectedLine;i<=newSelectedLine;i++)
                        $('.ticket-list-row-' + i).addClass('selected-table-line');
                else if(newSelectedLine<selectedLine)
                    for(i=selectedLine;i>=newSelectedLine;i--)
                        $('.ticket-list-row-' + i).addClass('selected-table-line');
            }
            else
                $('#ticket-list-row-' + ticketId).addClass('selected-table-line');

            if (ticket != null && $(window).width() > 1000)
            {
                messageText = ticket.messages[ticket.messages.length - 1].mt;
                previewContainer = $('#ticket-list-right');
                $('.ticket-action').removeClass('ui-disabled');
            }
        }
        else
        {
            $('#matching-ticket-list-'+elementId+'-row-' + ticketId).addClass('selected-table-line');
            messageText = (ticket != null ) ? ticket.messages[ticket.messages.length - 1].mt : '';
            previewContainer = $('#ticket-content-'+elementId+'-inner');
        }

        if(previewContainer != null)
        {
            messageText = lzm_commonTools.htmlEntities(messageText).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br />');
            if(lzm_displayHelper.matchSearch($('#search-ticket').val(),messageText))
            {
                var regEx = new RegExp($('#search-ticket').val(), "ig");
                messageText = messageText.replace(regEx, '<span class="search-match">'+$('#search-ticket').val()+'</span>');
            }

            try
            {
                var commhtml = '';

                for(var key in ticket.messages[ticket.messages.length-1].comment)
                {
                    var c = ticket.messages[ticket.messages.length-1].comment[key];
                    var coperator = DataEngine.operators.getOperator(c.o);
                    var messageTimeObject = lzm_chatTimeStamp.getLocalTimeObject(c.t * 1000, true);
                    var messageTimeHuman = lzm_commonTools.getHumanDate(messageTimeObject, '', lzm_chatDisplay.userLanguage);

                    commhtml += '<table class="comment-box bottom-space" style="border: 1px solid '+coperator.c+'"><tr><td>' + lzm_inputControls.createAvatarField('avatar-box-small','',coperator.id) + '</td><td><div class="text-s" style="color:#777 !important;padding-bottom:3px;">'+messageTimeHuman+'</div><span>' + lzm_commonTools.htmlEntities(coperator.name) + '</span>: ' + lzm_commonTools.htmlEntities(c.text) + '</td></tr></table>';
                }


                if(commhtml != '')
                {
                    commhtml = '<div id="ticket-list-comments">'+commhtml+'</div>';
                    messageText = commhtml + messageText;
                }

            }
            catch(ex)
            {

            }

            previewContainer.html(messageText);
        }
    }
    catch(e){deblog(e);}
}

function selectTicketMessage(ticketId, messageNumber) {

    $('.message-line').removeClass('selected-table-line');
    $('#ticket-history-table').data('selected-message', messageNumber);
    $('#message-line-' + ticketId + '_' + messageNumber).addClass('selected-table-line');
    $('.comment-line').removeClass('selected-table-line');
    $('.comment-line-' + ticketId + '_' + messageNumber).addClass('selected-table-line');

}

function handleTicketMessageClick(ticketId, messageNumber) {
    if ($('#ticket-history-table').data('selected-message') != messageNumber && $('#message-details-inner').data('edit'))
        toggleMessageEditMode();

    removeTicketMessageContextMenu();
    if (!$('#message-details-inner').data('edit'))
    {
        var ticket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);

        if(ticket != null)
        {
            selectTicketMessage(ticketId, messageNumber);
            var attachmentsHtml = lzm_chatDisplay.ticketDisplay.createTicketAttachmentTable(ticket, {id:''}, messageNumber, false,'ticket-details-placeholder-tab-1');
            var commentsHtml = lzm_chatDisplay.ticketDisplay.createTicketCommentTable(ticket, messageNumber, '','ticket-details-placeholder-tab-2');
            var detailsHtml = lzm_chatDisplay.ticketDisplay.createTicketMessageDetails(ticket.messages[messageNumber], {id: ''}, false, {cid: ''}, false);
            var messageHtml = lzm_commonTools.htmlEntities(ticket.messages[messageNumber].mt).replace(/\n/g, '<br />');

            $('#ticket-message-text').html(messageHtml);
            $('#ticket-message-details').html(detailsHtml);
            $('#ticket-attachment-list').html(attachmentsHtml);
            $('#ticket-comment-list').html(commentsHtml);

            $('#message-details-inner').data('message', ticket.messages[messageNumber]);
            $('#message-details-inner').data('email', {id: ''});
            $('#message-details-inner').data('is-new', false);
            $('#message-details-inner').data('chat', {cid: ''});
            $('#message-details-inner').data('edit', false);

            if(!lzm_chatDisplay.ticketDisplay.isFullscreenMode()){
                $('#ticket-history-placeholder-tab-0').click();
                $('#ticket-details-placeholder-tab-0').click();
            }
        }
    }
    UIRenderer.resizeTicketDetails();
}

function toggleMessageEditMode(ticketId, messageNumber, apply) {

    if (typeof ticketId != 'undefined' && ticketId != null && typeof messageNumber != 'undefined' && messageNumber != null) {
        handleTicketMessageClick(ticketId, messageNumber);
    }
    var message = $('#message-details-inner').data('message');
    var startEdit = !$('#message-details-inner').data('edit');

    if(startEdit && lzm_commonPermissions.permissions.tickets_edit_messages==0)
    {
        showNoPermissionMessage();
        return;
    }

    if (typeof apply != 'undefined' && apply) {
        message.fn = $('#change-message-name').val();
        message.em = $('#change-message-email').val();
        message.co = $('#change-message-company').val();
        message.s = $('#change-message-subject').val();
        message.p = $('#change-message-phone').val();
        message.mt = $('#change-message-text').val();
    }

    var detailsHtml = lzm_chatDisplay.ticketDisplay.createTicketMessageDetails(message, {id: ''}, false, {cid: ''}, startEdit);
    var messageHtml = (startEdit) ? '<textarea id="change-message-text" data-role="none">' + message.mt + '</textarea>' : lzm_commonTools.htmlEntities(message.mt).replace(/\n/g, '<br />');
    $('#ticket-message-details').html(detailsHtml);
    $('#ticket-message-text').html(messageHtml);

    if (startEdit)
        $('#ticket-details-placeholder-content-0').addClass('ticket-edit');
    else
        $('#ticket-details-placeholder-content-0').removeClass('ticket-edit');

    $('#message-details-inner').data('message', message);
    $('#message-details-inner').data('email', {id: ''});
    $('#message-details-inner').data('is-new', false);
    $('#message-details-inner').data('chat', {cid: ''});
    $('#message-details-inner').data('edit', startEdit);
    if (parseInt($('#ticket-details-placeholder-tabs-row').data('selected-tab')) >= 2) {
        $('#ticket-details-placeholder-tab-1').click();
    }
    UIRenderer.resizeTicketDetails();
}

function handleTicketCommentClick(commentNo, commentText) {

}

function handleTicketAttachmentClick(attachmentNo) {
    $('.attachment-line').removeClass('selected-table-line');
    $('#attachment-line-' + attachmentNo).addClass('selected-table-line');
    $('#attachment-table').data('selected-attachment', attachmentNo);
    $('#message-attachment-table').data('selected-attachment', attachmentNo);
    $('#remove-attachment').removeClass('ui-disabled');
}

function previewTicketAttachment(url) {
    if(url!=null)
        $('#att-img-preview-field').html('</span><img src="'+url+'">');
    else
        $('#att-img-preview-field').html('');


    UIRenderer.resizeTicketDetails();
}

function initSaveTicketDetails(ticket, channel, status, group, editor, language, name, email, company, phone, message, attachments, comments, customFields, subStatus, subChannel, chat, mc, subject, rem_time, rem_status, priority) {

    lzm_chatDisplay.ticketDisplay.LastActivity = lz_global_timestamp();

    mc = (typeof mc != 'undefined') ? mc : '';
    subject = (typeof subject != 'undefined') ? subject : '';
    status = status.toString();
    subStatus = (typeof subStatus == 'undefined' || subStatus == null) ? '' : subStatus;
    subChannel = (typeof subChannel == 'undefined' || subChannel == null) ? '' : subChannel;
    rem_time = (typeof rem_time == 'undefined' || rem_time == null) ? '0' : rem_time;
    rem_status = (typeof rem_status == 'undefined' || rem_status == null) ? '0' : rem_status;
    priority = (!d(priority)) ? '2' : priority;
    editor = (editor != -1) ? editor : '';

    var id = '', oe = '', os = '', og = '', ol = '';
    DataEngine.expectTicketChanges = true;

    if (d(ticket.id)) {
        id = ticket.id;
        og = ticket.gr;
        ol = ticket.l;
        if (ticket.editor != false) {
            og = ticket.editor.g;
            oe = ticket.editor.ed;
            os = ticket.editor.st;
        }

        if(subStatus != '' && !lzm_chatDisplay.ticketDisplay.subDefinitionIsValid(0,status,subStatus))
            subStatus = '';
        if(subChannel != '' && !lzm_chatDisplay.ticketDisplay.subDefinitionIsValid(1,channel,subChannel))
            subChannel = '';

        this.CommunicationEngine.uploadTickets.push({id: id, ne: editor, ns: status, ss: subStatus, sc: subChannel, nch: channel, ng: group, oe: oe, os: os, og: og, nl: language, ol: ol, mc: mc, vv: rem_time, vw: rem_status});
    }
    else
        this.CommunicationEngine.uploadTickets.push({nn: name, nem: email, nc: company, np: phone, nm: message, sub: subject, ne: editor, ns: status, ss: subStatus, sc: subChannel, ng: group, nl: language, nch: channel, at: attachments, co: comments, cf: customFields, vv: rem_time, vw: rem_status, vx: priority});
}

function uploadSaveTicketDetails(action, chat) {
    action = (d(action)) ? action : 'save-details';
    this.CommunicationEngine.pollServerTicket(lzm_commonTools.clone(this.CommunicationEngine.uploadTickets), [], action, chat);
    this.CommunicationEngine.uploadTickets = [];
}

function saveTicketTranslationText(myTicket, msgNo, text, type) {
    if (typeof type == 'undefined' || type != 'comment')
    {
        if (myTicket != null)
        {
            var ticketGroup = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.g : myTicket.gr;
            var ticketStatus = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.st : 0;
            var ticketOperator = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.ed : '';
            var mc = {tid: myTicket.id, mid: myTicket.messages[msgNo].id, n: myTicket.messages[msgNo].fn, e: myTicket.messages[msgNo].em,
                c: myTicket.messages[msgNo].co, p: myTicket.messages[msgNo].p, s: myTicket.messages[msgNo].s, t: text,
                custom: []};
            for (var i=0; i<myTicket.messages[msgNo].customInput.length; i++)
                mc.custom.push({id: myTicket.messages[msgNo].customInput[i].id, value: myTicket.messages[msgNo].customInput[i].text});
            initSaveTicketDetails(myTicket, myTicket.t, ticketStatus, ticketGroup, ticketOperator, myTicket.l, null, null, null, null, null, null, null, null, null, null, null, mc);
            uploadSaveTicketDetails();
        }
    }
    else if (myTicket != null)
        UserActions.saveTicketComment(myTicket.id, myTicket.messages[msgNo].id, text);
}

function setTicketOperator(ticketId, operatorId) {
    removeTicketContextMenu();
    var selTickets = $('tr.ticket-list-row.selected-table-line');
    selTickets.each(function()
    {
        var myTicket = lzm_chatDisplay.ticketDisplay.getTicketById($(this).attr('id').replace('ticket-list-row-',''));
        if (myTicket != null)
        {
            var ticketGroup = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.g : myTicket.gr;
            var ticketStatus = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.st : 0;
            initSaveTicketDetails(myTicket, myTicket.t, ticketStatus, ticketGroup, operatorId, myTicket.l, '', '', '', '', '');
        }
    });
    uploadSaveTicketDetails();
}

function setTicketGroup(ticketId, groupId) {
    removeTicketContextMenu();
    var selTickets = $('tr.ticket-list-row.selected-table-line');
    selTickets.each(function()
    {
        var myTicket = lzm_chatDisplay.ticketDisplay.getTicketById($(this).attr('id').replace('ticket-list-row-',''));
        if (myTicket != null)
        {
            var ticketEditor = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.ed : '';
            var ticketStatus = (typeof myTicket.editor != 'undefined' && myTicket.editor != false) ? myTicket.editor.st : 0;
            initSaveTicketDetails(myTicket, myTicket.t, ticketStatus, groupId, ticketEditor, myTicket.l, '', '', '', '', '');
        }
    });
    uploadSaveTicketDetails();
}

function setTicketPriority(_ticketId, _priorityKey) {
    var selTickets = $('tr.ticket-list-row.selected-table-line'),list=[];
    selTickets.each(function()
    {
        list.push({id: $(this).attr('id').replace('ticket-list-row-',''),priority: _priorityKey});
    });
    UserActions.setTicketPriority(list);
}

function changeTicketStatus(myStatus, mySubStatus, myChannel, mySubChannel, fromKey) {
    removeTicketContextMenu();
    if (lzm_chatDisplay.selectedTicketRow != '')
    {
        if (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'change_ticket_status', {}) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_open', {}) && myStatus == 0) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_progress', {}) && myStatus == 1) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_closed', {}) && myStatus == 2) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_deleted', {}) && myStatus == 3)) {
            showNoPermissionMessage();
        }
        else
        {
            var selTickets = $('tr.ticket-list-row.selected-table-line');
            var ticketId, i = 0, silent = selTickets.length>1;

            selTickets.each(function()
            {
                ticketId = $(this).attr('id').replace('ticket-list-row-','');
                var myTicket = lzm_chatDisplay.ticketDisplay.getTicketById(ticketId);
                var ticketGroup = myTicket.gr;
                var ticketEditor = -1;

                if (typeof myTicket.editor != 'undefined' && myTicket.editor != false) {
                    ticketGroup = myTicket.editor.g;
                    ticketEditor = myTicket.editor.ed;
                }

                var newStatus = (myStatus!=null) ? myStatus : ((myTicket.editor)? myTicket.editor.st:0);
                var newSubStatus = (mySubStatus!=null) ? mySubStatus : ((myTicket.editor)? myTicket.editor.ss:'');
                var newSubChannel = (mySubChannel!=null) ? mySubChannel : myTicket.s;
                var newChannel = (myChannel!=null) ? myChannel : myTicket.t;
                var deleteTicketMessage1 = t('Do you really want to remove this ticket irrevocably?');
                var deleteTicketMessage2 = t('You have replied to this request. Do you really want to remove this ticket?');
                var deleteTicketMessage3 = t('You have replied to this request. Do you really want to remove this ticket irrevocably?');
                var opHasAnswered = false;

                if (myTicket != null && d(myTicket.messages))
                    for (i=0; i<myTicket.messages.length; i++)
                        if (myTicket.messages[i].t == 1)
                            opHasAnswered = true;

                if (myStatus == 4)
                {
                    var mes = (opHasAnswered) ? deleteTicketMessage3 : deleteTicketMessage1;
                    lzm_commonDialog.createAlertDialog(mes, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
                    $('#alert-btn-ok').click(function() {
                        lzm_commonDialog.removeAlertDialog();
                        UserActions.deleteTicket(ticketId,silent);
                    });
                    $('#alert-btn-cancel').click(function() {
                        lzm_commonDialog.removeAlertDialog();
                    });
                    if(silent)
                        $('#alert-btn-ok').click();
                }
                else if (myStatus != 3)
                {
                    initSaveTicketDetails(myTicket, newChannel, newStatus, ticketGroup, ticketEditor, myTicket.l, '', '', '', '', '',null,null,null,newSubStatus,newSubChannel);
                }
                else if (myStatus == 3 && !opHasAnswered)
                {
                    initSaveTicketDetails(myTicket, newChannel, newStatus, ticketGroup, ticketEditor, myTicket.l, '', '', '', '', '',null,null,null,newSubStatus,newSubChannel);
                }
                else if (myStatus == 3 && opHasAnswered)
                {
                    lzm_commonDialog.createAlertDialog(deleteTicketMessage2, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
                    $('#alert-btn-ok').click(function() {
                        initSaveTicketDetails(myTicket, newChannel, newStatus, ticketGroup, ticketEditor, myTicket.l, '', '', '', '', '',null,null,null,newSubStatus,newSubChannel);
                        uploadSaveTicketDetails();
                        lzm_commonDialog.removeAlertDialog();
                    });
                    $('#alert-btn-cancel').click(function() {
                        lzm_commonDialog.removeAlertDialog();
                    });
                    if(silent)
                        $('#alert-btn-ok').click();
                }
            });
            uploadSaveTicketDetails();
        }
    }
}

function sendTicketMessage(ticket, receiver, cc, bcc, subject, message, comment, attachments, messageId, previousMessageId, addToWL) {
    var ticketFetchTime = DataEngine.ticketFetchTime;
    DataEngine.expectTicketChanges = true;
    UserActions.sendTicketReply(ticket, receiver, cc, bcc, subject, message, comment, attachments, messageId, previousMessageId, addToWL);
    switchTicketListPresentation(ticketFetchTime, 0, ticket.id);
}

function addOrEditResourceFromTicket(ticketId) {

    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null)
    {
        if (resource.ty == 0)
            UserActions.addQrd(1,ticketId, true);
        else if (resource.ty == 1)
        {
            resource.text = lzm_chatDisplay.ticketResourceText[ticketId];
            UserActions.editQrd(resource, ticketId, true);
        }
    }
}

function saveQrdFromTicket(resourceId, resourceText) {
    var resource = DataEngine.cannedResources.getResource(resourceId);
    if (resource != null)
    {
        if (lzm_commonPermissions.checkUserPermissions('', 'resources', 'edit', resource))
        {
            resource.text = resourceText.replace(/\n/g, '<br />');
            CommunicationEngine.PollServerResource({First:resource}, 'set');
        }
        else
            showNoPermissionMessage();
    }
}

function addQrdAttachment(closeToTicket) {
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null) {
        DataEngine.cannedResources.riseUsageCounter(lzm_chatDisplay.selectedResource);
        cancelQrd(closeToTicket);
        var resources1 = $('#reply-placeholder-content-1').data('selected-resources');
        var resources2 = $('#ticket-details-placeholder-content-1').data('selected-resources');
        var resources = (typeof resources1 != 'undefined') ? resources1 : (typeof resources2 != 'undefined') ? resources2 : [];
        resources.push(resource);
        $('#reply-placeholder-content-1').data('selected-resources', resources);
        $('#ticket-details-placeholder-content-1').data('selected-resources', resources);
        lzm_chatDisplay.ticketDisplay.updateAttachmentList();
    }
}

function insertQrdIntoTicket(ticketId) {
    var resource = DataEngine.cannedResources.getResource(lzm_chatDisplay.selectedResource);
    if (resource != null) {
        DataEngine.cannedResources.riseUsageCounter(lzm_chatDisplay.selectedResource);
        lzm_displayHelper.removeDialogWindow('qrd-tree-dialog');
        lzm_displayHelper.maximizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticketId] + '_reply');
        var replyText = '';
        switch(resource.ty) {
            case '1':
                replyText += resource.text
                    .replace(/^<p>/gi,'').replace(/^<div>/gi,'')
                    .replace(/<p>/gi,'<br>').replace(/<div>/gi,'<br>')
                    .replace(/<br>/gi,'\n').replace(/<br \/>/gi, '\n');
                if (replyText.indexOf('openLink') != -1) {
                    replyText = replyText.replace(/<a.*openLink\('(.*?)'\).*>(.*?)<\/a>/gi, '$2 ($1)');
                } else {
                    replyText = replyText.replace(/<a.*href="(.*?)".*>(.*?)<\/a>/gi, '$2 ($1)');
                }
                replyText = replyText.replace(/<.*?>/g, '').replace(/&nbsp;/gi, ' ')
                    .replace(/&.*?;/g, '');
                break;
            case '2':
                replyText += resource.ti + ':\n' + resource.text;
                break;
            default:
                var urlFileName = encodeURIComponent(resource.ti.replace(/ /g, '+'));
                var fileId = resource.text.split('_')[1];
                var urlParts = lzm_commonTools.getUrlParts(CommunicationEngine.chosenProfile.server_protocol + CommunicationEngine.chosenProfile.server_url, 0);
                var thisServer = ((urlParts.protocol == 'http://' && urlParts.port == 80) || (urlParts.protocol == 'https://' && urlParts.port == 443)) ?
                    urlParts.protocol + urlParts.urlBase + urlParts.urlRest : urlParts.protocol + urlParts.urlBase + ':' + urlParts.protocol + urlParts.urlRest;
                replyText += thisServer + '/getfile.php?';
                if (multiServerId != '') {
                    replyText += 'ws=' + multiServerId + '&';
                }
                replyText += 'file=' + urlFileName + '&id=' + fileId;
        }

        //$('#ticket-reply-input').val(replyText);
        insertAtCursor('ticket-reply-input', replyText);
        $('#ticket-reply-input-resource').val(resource.rid);

        if (resource.ty.toString() == '1' && (!resource.p || resource.p=='0'))
        {
            $('#ticket-reply-input-save').removeClass('ui-disabled');
        }
        else
        {
            $('#ticket-reply-input-save').addClass('ui-disabled');
        }
    }
}

function setAllTicketsRead() {
    CommunicationEngine.stopPolling();
    var maxTicketUpdated = CommunicationEngine.lastPollTime;
    if (parseInt(maxTicketUpdated) > parseInt(CommunicationEngine.ticketMaxRead)) {
        CommunicationEngine.ticketMaxRead = maxTicketUpdated;
        lzm_chatDisplay.ticketGlobalValues.mr = maxTicketUpdated;
    }
    CommunicationEngine.resetTickets = true;
    lzm_chatDisplay.ticketReadArray = [];
    lzm_chatDisplay.ticketUnreadArray = [];
    lzm_chatDisplay.ticketDisplay.updateTicketList(lzm_chatDisplay.ticketListTickets, lzm_chatDisplay.ticketGlobalValues,CommunicationEngine.ticketPage, CommunicationEngine.ticketSort,CommunicationEngine.ticketSortDir,CommunicationEngine.ticketQuery, CommunicationEngine.ticketFilterStatus,true);
    CommunicationEngine.startPolling();
    removeTicketContextMenu();
}

function changeTicketReadStatus(ticketId, status, doNotUpdate, forceRead) {
    removeTicketContextMenu();
    doNotUpdate = (typeof doNotUpdate != 'undefined') ? doNotUpdate : false;
    forceRead = (typeof forceRead != 'undefined') ? forceRead : false;
    DataEngine.expectTicketChanges = true;
    var ticket = {id: '', u: 0}, i;
    for (i=0; i<DataEngine.tickets.length; i++)
        if (DataEngine.tickets[i].id == ticketId)
            ticket = DataEngine.tickets[i];

    if ((ticket.id != '' && status == 'read' && ticket.u > CommunicationEngine.ticketMaxRead) ||
        (ticket.id != '' && status != 'read' && true)) {
        if (ticket.id == '') {
            for (i=0; i<lzm_chatDisplay.ticketListTickets.length; i++) {
                if (lzm_chatDisplay.ticketListTickets[i].id == ticketId) {
                    ticket = lzm_chatDisplay.ticketListTickets[i];
                }
            }
        }
        if (status == 'read') {
            if (forceRead) {
                lzm_chatDisplay.ticketReadArray = lzm_commonTools.removeTicketFromReadStatusArray(ticketId, lzm_chatDisplay.ticketReadArray);
                lzm_chatDisplay.ticketReadArray = lzm_commonTools.addTicketToReadStatusArray(ticket, lzm_chatDisplay.ticketReadArray, lzm_chatDisplay.ticketListTickets);
            } else if (ticket.u > lzm_chatDisplay.ticketGlobalValues.mr && lzm_commonTools.checkTicketReadStatus(ticket.id, lzm_chatDisplay.ticketReadArray) == -1) {
                lzm_chatDisplay.ticketReadArray = lzm_commonTools.addTicketToReadStatusArray(ticket, lzm_chatDisplay.ticketReadArray, lzm_chatDisplay.ticketListTickets);
            } else {
                lzm_chatDisplay.ticketUnreadArray = lzm_commonTools.removeTicketFromReadStatusArray(ticket.id, lzm_chatDisplay.ticketUnreadArray);
            }
        } else
        {
            if (ticket.u <= lzm_chatDisplay.ticketGlobalValues.mr && lzm_commonTools.checkTicketReadStatus(ticket.id, lzm_chatDisplay.ticketUnreadArray) == -1)
                lzm_chatDisplay.ticketUnreadArray.push({id: ticket.id, timestamp: lzm_chatTimeStamp.getServerTimeString(null, true)});

            else
                lzm_chatDisplay.ticketReadArray = lzm_commonTools.removeTicketFromReadStatusArray(ticket.id, lzm_chatDisplay.ticketReadArray);

        }
        if (!doNotUpdate)
            lzm_chatDisplay.ticketDisplay.updateTicketList(lzm_chatDisplay.ticketListTickets, lzm_chatDisplay.ticketGlobalValues,CommunicationEngine.ticketPage, CommunicationEngine.ticketSort, CommunicationEngine.ticketSortDir, CommunicationEngine.ticketQuery, CommunicationEngine.ticketFilterStatus,true);
    }
}

function sortTicketsBy(sortCriterium) {
    if (sortCriterium == CommunicationEngine.ticketSort)
        CommunicationEngine.ticketSortDir = (CommunicationEngine.ticketSortDir=='ASC') ? 'DESC' : 'ASC';
    $('.ticket-list-page-button').addClass('ui-disabled');
    var ticketFetchTime = DataEngine.ticketFetchTime;
    DataEngine.expectTicketChanges = true;
    CommunicationEngine.stopPolling();
    CommunicationEngine.ticketSort = sortCriterium;
    CommunicationEngine.resetTickets = true;
    CommunicationEngine.startPolling();
    switchTicketListPresentation(ticketFetchTime, 0);
}

function searchTickets(searchString) {
    lzm_chatDisplay.ticketDisplay.UpdateSearchSettings(false);
    var ticketFetchTime = DataEngine.ticketFetchTime;
    DataEngine.expectTicketChanges = true;
    CommunicationEngine.stopPolling();
    CommunicationEngine.ticketQuery = searchString;
    CommunicationEngine.ticketPage = 1;
    CommunicationEngine.resetTickets = true;
    CommunicationEngine.startPolling();
    switchTicketListPresentation(ticketFetchTime, 0);
}

function cancelTicketReply(ticketId, windowId, dialogId) {

    var doCancel = function(){
        if($.inArray(ticketId,lzm_chatDisplay.ticketDisplay.pausedTicketReplies) != -1)
        {
            lzm_chatDisplay.ticketDisplay.pausedTicketReplies.splice($.inArray(ticketId,lzm_chatDisplay.ticketDisplay.pausedTicketReplies), 1 );
        }
        lzm_displayHelper.removeDialogWindow(windowId);
        lzm_displayHelper.maximizeDialogWindow(dialogId);
    };
    var cancel = false;
    if($('#ticket-reply-input').val().length)
    {
        lzm_commonDialog.createAlertDialog(tid('close_confirm'), [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
        $('#alert-btn-ok').click(function()
        {
            $('#alert-btn-cancel').click();
            doCancel();
        });
        $('#alert-btn-cancel').click(function()
        {
            lzm_commonDialog.removeAlertDialog();
        });
    }
    else
        doCancel();
}

function pauseTicketReply(ticketId, windowId, dialogId) {

    if($.inArray(ticketId,lzm_chatDisplay.ticketDisplay.pausedTicketReplies) == -1)
        lzm_chatDisplay.ticketDisplay.pausedTicketReplies.push(ticketId);

    var menuEntry = '';
    try
    {
        if (typeof lzm_chatDisplay.StoredDialogs[dialogId].data.menu != 'undefined')
            menuEntry = lzm_chatDisplay.StoredDialogs[dialogId].data.menu;
    }
    catch(ex){
    }

    lzm_displayHelper.minimizeDialogWindow(dialogId+'_reply', 'ticket-details',{'ticket-id': ticketId, menu: menuEntry}, 'tickets', false);
    lzm_displayHelper.maximizeDialogWindow(dialogId);

}

function showMessageReply(ticketId, messageNo, groupId) {
    var i, ticket;
    for (i=0; i<lzm_chatDisplay.ticketListTickets.length; i++) {
        if (lzm_chatDisplay.ticketListTickets[i].id == ticketId) {
            ticket = lzm_chatDisplay.ticketListTickets[i];
        }
    }
    var selectedGroup = DataEngine.groups.getGroup(groupId);
    lzm_chatDisplay.ticketDisplay.showMessageReply(ticket, messageNo, selectedGroup);
}

function deleteSalutationString(e, salutationField, salutationString) {
    e.stopPropagation();
    lzm_commonTools.deleteTicketSalutation(salutationField, salutationString);
}

function toggleEmailList() {
    if ($('#email-list-container').length == 0)
    {
        var storedPreviewId = '';
        for (var key in lzm_chatDisplay.StoredDialogs) {
            if (lzm_chatDisplay.StoredDialogs.hasOwnProperty(key)) {
                if (lzm_chatDisplay.StoredDialogs[key].type == 'email-list') {
                    storedPreviewId = key;
                }
            }
        }
        if (storedPreviewId != '')
        {
            lzm_displayHelper.maximizeDialogWindow(storedPreviewId);
        }
        else
        {
            lzm_chatDisplay.ticketDisplay.showEmailList();
            CommunicationEngine.stopPolling();
            CommunicationEngine.emailUpdateTimestamp = 0;
            CommunicationEngine.addPropertyToDataObject('p_de_a', CommunicationEngine.emailAmount);
            CommunicationEngine.addPropertyToDataObject('p_de_s', 0);
            CommunicationEngine.startPolling();
        }
    }
    else
    {
        CommunicationEngine.stopPolling();
        CommunicationEngine.removePropertyFromDataObject('p_de_a');
        CommunicationEngine.removePropertyFromDataObject('p_de_s');
        CommunicationEngine.emailAmount = 20;
        CommunicationEngine.startPolling();
    }
}

function deleteEmail() {

    var emailNo = 0, emailId = '';
    $('.selected-table-line').each(function(i, obj) {
        if($(obj).hasClass('email-list-line')){
            emailId = $(obj).attr('data-id');
            emailNo = $(obj).attr('data-line-number');
            lzm_chatDisplay.emailDeletedArray.push(emailId);
            $('#email-list-line-' + emailNo).children('td:first').html('<i class="fa fa-remove" style="color: #cc0000;"></i>');
            $('#reset-emails').removeClass('ui-disabled');
            $('#delete-email').addClass('ui-disabled');
            $('#create-ticket-from-email').addClass('ui-disabled');
            if ($('#email-list-line-' + (parseInt(emailNo) + 1)).length > 0)
                $('#email-list-line-' + (parseInt(emailNo) + 1)).click();
        }
    });

    scrollToEmail(emailNo);
}

function scrollToEmail(no){
    if(no > 0)
        $("#email-list-placeholder-content-0").scrollTop(parseInt(no) * 22);
}

function saveEmailListChanges(emailId, assign) {
    var i, emailChanges = [], ticketsCreated = [], emailListObject = {};
    if (emailId != '') {
        var editorId = (assign) ? lzm_chatDisplay.myId : '';
        if (emailId instanceof Array) {
            for (i=0; i<emailId.length; i++) {
                emailChanges.push({id: emailId[i], status: '0', editor: editorId})
            }
        } else {
            emailChanges = [{
                id: emailId, status: '0', editor: editorId
            }];
        }
    } else {
        for (i=0; i<DataEngine.emails.length; i++) {
            emailListObject[DataEngine.emails[i].id] = DataEngine.emails[i];
        }

        for (i=0; i<lzm_chatDisplay.emailDeletedArray.length; i++) {
            emailChanges.push({id: lzm_chatDisplay.emailDeletedArray[i], status: '1', editor: ''})
        }

        for (i=0; i<lzm_chatDisplay.ticketsFromEmails.length; i++)
        {
            var thisEmail = emailListObject[lzm_chatDisplay.ticketsFromEmails[i]['email-id']];
            if(d(thisEmail))
            {
                emailChanges.push({id: thisEmail.id, status: '1', editor: ''});
                ticketsCreated.push({
                    name: lzm_chatDisplay.ticketsFromEmails[i].name,//thisEmail.n,
                    email: lzm_chatDisplay.ticketsFromEmails[i].email,//thisEmail.e,
                    subject: lzm_chatDisplay.ticketsFromEmails[i].subject,//thisEmail.s,
                    text: lzm_chatDisplay.ticketsFromEmails[i].message,
                    group: lzm_chatDisplay.ticketsFromEmails[i].group,
                    cid: thisEmail.id,
                    channel: lzm_chatDisplay.ticketsFromEmails[i].channel,
                    company: lzm_chatDisplay.ticketsFromEmails[i].company,
                    phone: lzm_chatDisplay.ticketsFromEmails[i].phone,
                    language: lzm_chatDisplay.ticketsFromEmails[i].language,
                    status: lzm_chatDisplay.ticketsFromEmails[i].status,
                    editor: (lzm_chatDisplay.ticketsFromEmails[i].editor != -1) ? lzm_chatDisplay.ticketsFromEmails[i].editor : '',
                    attachment: thisEmail.attachment,
                    comment: lzm_chatDisplay.ticketsFromEmails[i].comment,
                    custom: lzm_chatDisplay.ticketsFromEmails[i].custom
                });
            }
        }
    }
    UserActions.saveEmailChanges(emailChanges, ticketsCreated);
}

function showHtmlEmail(emailIdEnc) {
    removeTicketMessageContextMenu();
    var htmlEmailUrl = CommunicationEngine.chosenProfile.server_protocol + CommunicationEngine.chosenProfile.server_url + '/email.php?id=' + emailIdEnc;
    openLink(htmlEmailUrl);
}

function printTicketMessage(ticketId, msgNo) {
    removeTicketMessageContextMenu();
    var myTicket = null;
    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
    {
        if (lzm_chatDisplay.ticketListTickets[i].id == ticketId)
        {
            myTicket = lzm_chatDisplay.ticketListTickets[i];
        }
    }
    if (myTicket != null && myTicket.messages.length > msgNo) {
        lzm_commonTools.printContent('message', {ticket: myTicket, msgNo: msgNo});
    }
}

function showPhoneCallDialog(objectId, lineNo, caller) {
    if (caller == 'ticket') {
        var ticket = null;
        var messageNo = parseInt(lineNo);
        for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
            if (lzm_chatDisplay.ticketListTickets[i].id == objectId)
                ticket = lzm_chatDisplay.ticketListTickets[i];

        if (ticket != null && ticket.messages.length > messageNo) {
            lzm_chatDisplay.openPhoneCallDialog(ticket, messageNo, caller);
        }
    }
    else if (caller == 'chat')
    {
        var visitorBrowser = VisitorManager.GetVisitorBrowser(objectId);
        if (visitorBrowser[1] != null)
            lzm_chatDisplay.openPhoneCallDialog(visitorBrowser, -1, caller);
    }
}

function startPhoneCall(protocol, phoneNumber) {
    IFManager.IFInitPhoneCall(protocol, phoneNumber);
}

function handleTicketTree(_show){

    if(lzm_chatDisplay.windowWidth > 800)
    {
        if(typeof _show == 'undefined')
            _show = lzm_commonStorage.loadValue('show_ticket_tree_' + DataEngine.myId) != 1;
        lzm_commonStorage.saveValue('show_ticket_tree_' + DataEngine.myId,(_show) ? 1 : 0);

    }
    else
        lzm_chatDisplay.ticketDisplay.CategorySelect = !lzm_chatDisplay.ticketDisplay.CategorySelect;

    UIRenderer.resizeTicketList();
}

function handleTicketTreeClickEvent(_id,_parent,_subStatus,_initPoll){

    _initPoll = (d(_initPoll)) ? _initPoll : true;
    _parent = (d(_parent)) ? _parent : null;
    _subStatus = (d(_subStatus)) ? _subStatus : null;

    $('#ticket-list-tree div').removeClass('selected-treeview-div');
    $('#'+_id).addClass('selected-treeview-div');

    lzm_commonStorage.saveValue('show_ticket_cat_' + DataEngine.myId,_id);

    if(lzm_chatDisplay.ticketDisplay.CategorySelect)
    {
        lzm_chatDisplay.ticketDisplay.CategorySelect = false;
        UIRenderer.resizeTicketList();
    }

    var value = "";
    value += ((_id == "tnFilterStatusActive" || _id == "tnFilterStatusOpen" || _parent == "tnFilterStatusOpen") ? '1' : '0');
    value += ((_id == "tnFilterStatusActive" || _id == "tnFilterStatusInProgress" || _parent == "tnFilterStatusInProgress")? '1' : '0');
    value += ((_id == "tnFilterStatusClosed" || _parent == "tnFilterStatusClosed")? '1' : '0');
    value += ((_id == "tnFilterStatusDeleted" || _parent == "tnFilterStatusDeleted")? '1' : '0');
    value += ((_id == "tnFilterMyTickets" || _parent == "tnFilterMyTickets")? '1' : '0');
    value += ((_id == "tnFilterMyGroupsTickets" || _parent == "tnFilterMyGroupsTickets")? '1' : '0');

    if(_subStatus != null)
        CommunicationEngine.ticketFilterSubStatus = _subStatus;
    else
        CommunicationEngine.ticketFilterSubStatus = null;

    CommunicationEngine.ticketFilterPersonal = value.substr(4, 1) == "1";
    CommunicationEngine.ticketFilterGroup = value.substr(5, 1) == "1";
    CommunicationEngine.ticketFilterWatchList = (_id == 'tnFilterWatchList');
    var f = "";

    f += value.substr(0, 1) == "1" || CommunicationEngine.ticketFilterPersonal || CommunicationEngine.ticketFilterGroup ? "0" : "";
    f += value.substr(1, 1) == "1" || CommunicationEngine.ticketFilterPersonal || CommunicationEngine.ticketFilterGroup ? "1" : "";
    f += value.substr(2, 1) == "1" ? "2" : "";
    f += value.substr(3, 1) == "1" ? "3" : "";

    CommunicationEngine.ticketFilterStatus = f;

    if(_initPoll)
        toggleTicketFilter();
}

function toggleTicketFilter() {

    var ticketFetchTime = DataEngine.ticketFetchTime;
    DataEngine.expectTicketChanges = true;
    CommunicationEngine.stopPolling();
    CommunicationEngine.ticketPage = 1;
    CommunicationEngine.resetTickets = true;
    CommunicationEngine.startPolling();
    switchTicketListPresentation(ticketFetchTime, 0);
}

function addTicketToWatchList(_ticketId,_operatorId){
    removeTicketContextMenu();
    var selTickets = $('tr.ticket-list-row.selected-table-line'),toAdd=[];
    selTickets.each(function()
    {
        toAdd.push({id: $(this).attr('id').replace('ticket-list-row-',''),operatorId: _operatorId});
    });
    UserActions.addTicketToWatchList(toAdd);
}

function removeTicketFromWatchList(){
    removeTicketContextMenu();
    var selTickets = $('tr.ticket-list-row.selected-table-line'),toRemove=[];
    selTickets.each(function()
    {
        toRemove.push({id: $(this).attr('id').replace('ticket-list-row-','')});
    });
    UserActions.removeTicketFromWatchList(toRemove);
}

function mergeTickets(){
    removeTicketContextMenu();
    var selTickets = $('tr.ticket-list-row.selected-table-line'),toMerge=[],objList=[],i;
    if(selTickets.length>=2){
        selTickets.each(function()
        {
            toMerge.push($(this).attr('id').replace('ticket-list-row-',''));
        });

        function stid(a, b){
            return ((a > b) ? -1 : ((a < b) ? 1 : 0));
        }

        toMerge.sort(stid);

        for(i=1;i<selTickets.length;i++)
            CommunicationEngine.pollServerSpecial({fo: 'ticket', so: 'ticket', fid: toMerge[0], sid: toMerge[i]}, 'link-ticket');
    }
}

/**************************************** Archive functions ****************************************/
function pageArchiveList(page) {
    $('.archive-list-page-button').addClass('ui-disabled');
    CommunicationEngine.stopPolling();
    var archiveFetchTime = DataEngine.archiveFetchTime;
    DataEngine.expectArchiveChanges = true;
    CommunicationEngine.chatArchivePage = page;
    CommunicationEngine.resetChats = true;
    CommunicationEngine.startPolling();
    switchArchivePresentation(archiveFetchTime, 0);
}

function searchArchive(searchString) {
    $('.archive-list-page-button').addClass('ui-disabled');
    var archiveFetchTime = DataEngine.archiveFetchTime;
    CommunicationEngine.chatArchiveQuery = searchString.replace(/^ +/, '').replace(/ +$/, '').toLowerCase();
    CommunicationEngine.chatArchivePage = 1;
    CommunicationEngine.chatArchiveFilter = '012';
    CommunicationEngine.resetChats = true;
    CommunicationEngine.pollServer();
    switchArchivePresentation(archiveFetchTime, 0);
}

function openArchiveFilterMenu(e, filter) {
    filter = (filter != '') ? filter : CommunicationEngine.chatArchiveFilter;
    e.stopPropagation();
    if (lzm_chatDisplay.showArchiveFilterMenu) {
        removeArchiveFilterMenu();
    } else {
        var parentOffset = $('#archive-filter').offset();
        var xValue = parentOffset.left;
        var yValue = parentOffset.top + 25;
        lzm_chatDisplay.showArchiveFilterMenu = true;
        lzm_chatDisplay.showContextMenu('archive-filter', {filter: filter}, xValue, yValue);
        e.preventDefault();
    }
}

function removeArchiveFilterMenu() {
    lzm_chatDisplay.showArchiveFilterMenu = false;
    $('#archive-filter-context').remove();
}

function toggleArchiveFilter(filter, e) {

    e.stopPropagation();
    $('.archive-list-page-button').addClass('ui-disabled');
    //CommunicationEngine.stopPolling();
    var archiveFetchTime = DataEngine.archiveFetchTime;
    DataEngine.expectArchiveChanges = true;
    removeArchiveFilterMenu();

    var filterList = CommunicationEngine.chatArchiveFilter.split('');
    if ($.inArray(filter.toString(), filterList) != -1) {
        var pattern = new RegExp(filter.toString());
        CommunicationEngine.chatArchiveFilter = CommunicationEngine.chatArchiveFilter.replace(pattern, '');
    } else {
        filterList.push(filter);
        filterList.sort();
        CommunicationEngine.chatArchiveFilter = filterList.join('');
    }
    if (CommunicationEngine.chatArchiveFilter == '') {
        CommunicationEngine.chatArchiveFilter = '012';
    }

    switchArchivePresentation(archiveFetchTime, 0);
    CommunicationEngine.resetChats = true;
    CommunicationEngine.chatArchivePage = 1;
    CommunicationEngine.pollServer();
}

function switchArchivePresentation(archiveFetchTime, counter) {
    var loadingHtml;
    if (counter == 0) {
        if ($('#matching-chats-table').length == 0) {

            $('#chat-archive-table tbody').empty();
            loadingHtml = '<div id="archive-loading"><div class="lz_anim_loading"></div></div>';
            $('#archive-body').append(loadingHtml).trigger('create');
            $('#archive-loading').css({position: 'absolute',left:0,top:0,bottom:0,right:0,'background-color': '#ffffff','z-index': 1000, opacity: 0.85});
        } else {
            loadingHtml = '<div id="matching-archive-loading"><div class="lz_anim_loading"></div></div>';
            $('#visitor-info-placeholder-content-5').append(loadingHtml).trigger('create');
            $('#matching-archive-loading').css({position: 'absolute', left:0,top:0,bottom:0,right:0,'background-color': '#ffffff','z-index': 1000, opacity: 0.85});
        }
    }
    if (archiveFetchTime != DataEngine.archiveFetchTime || counter >= 40)
    {
        if ($('#matching-chats-table').length == 0)
        {
            lzm_chatDisplay.archiveDisplay.createArchive();
            $('#archive-loading').remove();
            selectArchivedChat();
        }
        else
        {
            $('#matching-archive-loading').remove();
            selectArchivedChat($('#matching-chats-table').data('selected-chat-id'), true);
        }
    }
    else
    {
        counter++;
        var delay = (counter <= 5) ? 200 : (counter <= 11) ? 500 : (counter <= 21) ? 1000 : 2000;
        setTimeout(function() {switchArchivePresentation(archiveFetchTime, counter);}, delay);
    }
}

function openArchiveListContextMenu(e, chatId, elementId) {
    e.preventDefault();
    selectArchivedChat(chatId, false, elementId);
    if (lzm_chatDisplay.showArchiveListContextMenu) {
        removeArchiveListContextMenu();
    } else {
        var archivedChat = null;
        for (var i=0; i<DataEngine.chatArchive.chats.length; i++) {
            if (DataEngine.chatArchive.chats[i].cid == chatId) {
                archivedChat = lzm_commonTools.clone(DataEngine.chatArchive.chats[i]);
            }
        }
        if (archivedChat != null) {
            lzm_chatDisplay.showArchiveListContextMenu = true;
            e.stopPropagation();
            var parentOffset = $('#archive-body').offset();

            var xValue = e.pageX - parentOffset.left + $('#ticket-history-placeholder-content-0').scrollLeft();
            var yValue = e.pageY - parentOffset.top + $('#ticket-history-placeholder-content-0').scrollTop();

            lzm_chatDisplay.showContextMenu('archive', archivedChat, xValue, yValue);
        }
    }
}

function removeArchiveListContextMenu() {
    lzm_chatDisplay.showArchiveListContextMenu = false;
    $('#archive-context').remove();
}

function sendChatTranscriptTo(chatId, dialogId, windowId, dialogData) {
    lzm_chatDisplay.archiveDisplay.sendChatTranscriptTo(chatId, dialogId, windowId, dialogData);
}

function printArchivedChat(chatId) {
    removeArchiveListContextMenu();
    var myChat = null;
    for (var i=0; i<DataEngine.chatArchive.chats.length; i++) {
        if (DataEngine.chatArchive.chats[i].cid == chatId) {
            myChat = DataEngine.chatArchive.chats[i];
        }
    }
    if (myChat != null) {
        lzm_commonTools.printContent('chat', {chat: myChat});
    }
}

/**************************************** Report functions ****************************************/
function pageReportList(page) {
    $('#report-list-table').data('selected-report', '');
    $('.report-list-page-button').addClass('ui-disabled');
    $('#report-filter').addClass('ui-disabled');
    var reportFetchTime = DataEngine.reportFetchTime;
    DataEngine.expectReportChanges = true;
    CommunicationEngine.stopPolling();
    CommunicationEngine.reportPage = page;
    CommunicationEngine.resetReports = true;
    CommunicationEngine.startPolling();
    switchReportListPresentation(reportFetchTime, 0);
}

function switchReportListPresentation(reportFetchTime, counter) {
    var loadingHtml, myWidth, myHeight;
    if (counter == 0) {
        loadingHtml = '<div id="report-list-loading"><div class="lz_anim_loading"></div></div>';
        $('#report-list-body').append(loadingHtml).trigger('create');
        $('#report-list-loading').css({position:'absolute',left:0,top:0,bottom:0,right:0,'background-color': '#ffffff','z-index': 1000, opacity: 0.85});
    }
    if (reportFetchTime != DataEngine.reportFetchTime || counter >= 40) {
        lzm_chatDisplay.reportsDisplay.createReportList();
    } else {
        counter++;
        var delay = (counter <= 5) ? 200 : (counter <= 11) ? 500 : (counter <= 21) ? 1000 : 2000;
        setTimeout(function() {switchReportListPresentation(reportFetchTime, counter);}, delay);
    }
}

function openReportContextMenu(e, reportId, canBeReCalculated) {
    e.stopPropagation();
    e.preventDefault();
    removeReportFilterMenu();
    selectReport(reportId);
    if (lzm_chatDisplay.showReportContextMenu) {
        removeReportContextMenu();
    } else {
        var scrolledDownY, scrolledDownX, parentOffset;
        var place = 'report-list';
        scrolledDownY = $('#' + place +'-body').scrollTop();
        scrolledDownX = $('#' + place +'-body').scrollLeft();
        parentOffset = $('#' + place +'-body').offset();
        var xValue = e.pageX - parentOffset.left + scrolledDownX;
        var yValue = e.pageY - parentOffset.top + scrolledDownY;

        var report = DataEngine.reports.getReport(reportId);
        report.canBeReCalculated = canBeReCalculated;
        if (report != null) {
            lzm_chatDisplay.showReportContextMenu = true;
            lzm_chatDisplay.showContextMenu(place, report, xValue, yValue);
        }
    }
}

function openReportFilterMenu(e) {
    var filter = CommunicationEngine.reportFilter;
    e.stopPropagation();
    if (lzm_chatDisplay.showReportFilterMenu) {
        removeReportFilterMenu();
    } else {
        var parentOffset = $('#report-filter').offset();
        var xValue = parentOffset.left + 10;
        var yValue = parentOffset.top + 25;
        lzm_chatDisplay.showReportFilterMenu = true;
        lzm_chatDisplay.showContextMenu('report-filter', {filter: filter}, xValue, yValue);
        e.preventDefault();
    }
}

function removeReportFilterMenu() {
    lzm_chatDisplay.showReportFilterMenu = false;
    $('#report-filter-context').remove();
}

function removeReportContextMenu() {
    lzm_chatDisplay.showReportContextMenu = false;
    $('#report-list-context').remove();
}

function selectReport(reportId) {
    $('#report-list-table').data('selected-report', reportId);
    $('.report-list-line').removeClass('selected-table-line');
    $('#report-list-line-' + reportId).addClass('selected-table-line');
}

function recalculateReport(reportId) {
    removeReportContextMenu();
    if (!lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'reports', 'recalculate', {}))
    {
        showNoPermissionMessage();
    }
    else
    {
        var report = DataEngine.reports.getReport(reportId);
        if (report != null)
        {
            CommunicationEngine.pollServerSpecial({year: report.y, month: report.m, day: report.d, time: report.t, mtime: report.mt}, 'recalculate-report');
        }
    }
}

function loadReport(reportId, type) {
    var report = DataEngine.reports.getReport(reportId);
    if (report != null) {
        var reportUrl = DataEngine.chosen_profile.server_protocol + DataEngine.chosen_profile.server_url;
        if (type == 'report') {
            reportUrl += '/report.php?h=' + report.i + '&y=' + report.y + '&m=' + report.m + '&d=' + report.d;
            if (multiServerId != '') {
                reportUrl += '&ws=' + multiServerId;
            }
        } else if (type == 'visitors') {
            reportUrl += '/report.php?h=' + report.i + '&y=' + report.y + '&m=' + report.m + '&d=' + report.d + '&u=1';
            if (multiServerId != '') {
                reportUrl += '&ws=' + multiServerId;
            }
        }
        openLink(reportUrl);
    }
}

function toggleReportFilter(filter, e) {
    e.stopPropagation();
    $('.report-list-page-button').addClass('ui-disabled');
    $('#report-filter').addClass('ui-disabled');
    CommunicationEngine.stopPolling();
    var reportFetchTime = DataEngine.reportFetchTime;
    DataEngine.expectReportChanges = true;
    removeReportFilterMenu();
    CommunicationEngine.reportFilter = filter;
    CommunicationEngine.reportPage = 1;
    CommunicationEngine.startPolling();
    CommunicationEngine.resetReports = true;
    switchReportListPresentation(reportFetchTime, 0);
}

/**************************************** Operator and group functions ****************************************/
function createPublicGroup() {
    if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'group', '', {o: lzm_chatDisplay.myId}))
        lzm_chatDisplay.createPublicGroup();
    else
        showNoPermissionMessage();
}

function saveNewDynamicGroup() {
    var newGroupName = $('#new-dynamic-group-name').val().replace(/^ */, '').replace(/ *$/, '');
    lzm_chatDisplay.doNotUpdateOpList = false;
    if (newGroupName != '')
    {
        UserActions.SaveChatGroup('create', '', newGroupName, '');
    }
    else
    {
        $('#operator-list-line-new-' + lzm_chatDisplay.newDynGroupHash).remove();
        lzm_chatDisplay.createOperatorList();
    }
}

function deleteChatGroup(id) {
    var group = DataEngine.groups.getGroup(id);
    if (group != null && typeof group.members != 'undefined') {
        if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'group', '', group))
        {
            lzm_commonDialog.createAlertDialog(tid('remove_items'), [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
            $('#alert-btn-ok').click(function()
            {
                lzm_commonDialog.removeAlertDialog();
                UserActions.SaveChatGroup('delete', id, '', '');
                DataEngine.groups.setGroupProperty(id, 'is_active', false);
                if (lzm_chatDisplay.selected_view == 'internal')
                    lzm_chatDisplay.createOperatorList();
                else if (lzm_chatDisplay.selected_view == 'mychats')
                    lzm_chatDisplay.DrawChatPanel();
            });
            $('#alert-btn-cancel').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        }
        else
            showNoPermissionMessage();
    }
}

function getDynamicGroupURL(id) {
    var URL = DataEngine.getServerUrl('chat.php') + '?edg=' + lz_global_base64_url_encode(id);
    var urlBox = lzm_inputControls.createArea('dyn-group-url', '', '','URL:','width:300px;height:80px;');
    lzm_commonDialog.createAlertDialog(urlBox, [{id: 'ok', name: tid('ok')}],null,null,true);
    $('#dyn-group-url').val(URL);
    $('#dyn-group-url').select();
    $('#alert-btn-ok').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
}

function addToChatGroup(id, browserId, chatId) {
    if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'group', '', {o: lzm_chatDisplay.myId}))
    {
        var activeUserChat = DataEngine.ChatManager.GetChat(chatId,'i');
        if (lzm_chatDisplay.selected_view == 'mychats' && activeUserChat != null)
        {
            saveChatInput(ChatManager.ActiveChat);
            removeEditor();
        }


        lzm_chatDisplay.addToChatGroup(id, browserId, chatId);

    }
    else
        showNoPermissionMessage();
    lzm_chatDisplay.RemoveAllContextMenus();
}

function addressChatMember(id,name){
    saveChatInput(id, "<i>@" + lz_global_base64_decode(name) + '</i>&nbsp;');
    //openLastActiveChat();
}

function removeFromChatGroup(id, groupId) {

    if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'group', '', DataEngine.groups.getGroup(groupId)))
    {
        var browserId = '', isGroupOwner = false;
        if (id.indexOf('~') != -1)
        {
            browserId = id.split('~')[1];
            id = id.split('~')[0];
        }
        var group = DataEngine.groups.getGroup((groupId));
        if (group != null && group.o == id)
            isGroupOwner = true;

        if (!isGroupOwner)
        {
            var visitorchatobj = DataEngine.ChatManager.GetChat(id+'~'+id+'_OVL');
            if(visitorchatobj != null && visitorchatobj.Type == Chat.Visitor && !visitorchatobj.Members.length)
            {
                takeChat(id, id + '_OVL', visitorchatobj.i, visitorchatobj.dcg);
            }
            else
                UserActions.SaveChatGroup('remove', groupId, '', id, {browserId: browserId});

            var chatobj = DataEngine.ChatManager.GetChat(groupId);
            if(chatobj != null)
            {
                addOperatorLeftMessageToChat(chatobj,[{i:id}]);
                chatobj.CloseChatTab();
                showAllchatsList(true);
            }
        }
        else
        {
            var alertText =  t('The owner of a group must be member of the group.');
            lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        }
    }
    else
        showNoPermissionMessage();

    lzm_chatDisplay.RemoveAllContextMenus();
}

function selectChatGroup(groupId) {
    $('.dynamic-group-line').removeClass('selected-table-line');
    $('#dynamic-group-line-' + groupId).addClass('selected-table-line');
    $('#dynamic-group-table').data('selected-group', groupId);
}

function openOperatorListContextMenu(e, type, id, lineId, groupId, lineCounter) {
    e.stopPropagation();
    var chatPartner = null, browser = {};
    switch (type) {
        case 'group':
            if (id != 'everyoneintern') {
                chatPartner = DataEngine.groups.getGroup(id);
            } else {
                chatPartner = {id: id, name: tid('all_operators')};
            }
            break;
        case 'operator':
            chatPartner = DataEngine.operators.getOperator(id);
            break;
        case 'visitor':
            chatPartner = VisitorManager.GetVisitor(id.split('-')[0]);
            if (typeof chatPartner.b != 'undefined') {
                for (var i=0; i<chatPartner.b.length; i++)
                    if (chatPartner.b[i].id == id.split('~')[1])
                        browser = chatPartner.b[i];
            }
            else
                browser = {id: ''};

            break;
    }
    if (chatPartner != null) {
        selectOperatorLine(lineId, lineCounter, e);
        var scrolledDownY = $('#operator-list-body').scrollTop();
        var scrolledDownX = $('#operator-list-body').scrollLeft();
        var parentOffset = $('#operator-list-body').offset();
        var yValue = e.pageY - parentOffset.top + scrolledDownY;
        var xValue = e.pageX - parentOffset.left + scrolledDownX;
        lzm_chatDisplay.showContextMenu('operator-list', {type: type, 'chat-partner': chatPartner, groupId: groupId,
            'browser': browser, 'line-id': lineId}, xValue, yValue);
    }
    e.preventDefault();
}

function selectInviteOperatorLine(lineId) {
    $('#forward-receiver-table tr.selected-table-line').removeClass('selected-table-line');
    $('#' + lineId).addClass('selected-table-line');
}

function selectOperatorLine(lineId, lineCounter, sysid, userid, name, fromOpList) {

    try
    {
        name = lz_global_base64_url_decode(name);
        var now = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
        var internalChatsAreDisabled = (lzm_chatDisplay.myGroups.length > 0);
        for (var i=0; i<lzm_chatDisplay.myGroups.length; i++) {
            var myGr = DataEngine.groups.getGroup(lzm_chatDisplay.myGroups[i]);
            if (myGr != null && (typeof myGr.internal == 'undefined' || myGr.internal == '1'))
                internalChatsAreDisabled = false;

        }
        if (!internalChatsAreDisabled &&((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) && lastOpListClick[0] == lineId && now - lastOpListClick[1] < 500 &&
            d(userid) && d(name) && d(fromOpList)) {

            chatInternalWith(sysid, userid, name, fromOpList)
        } else {
            lastOpListClick = [lineId, now];
            lzm_chatDisplay.m_OperatorsListSelectedLine = lineCounter;
            setTimeout(function() {
                $('.operator-list-line').removeClass('selected-table-line');
                $('#' + lineId).addClass('selected-table-line');
            }, 1);
        }
    }
    catch(ex)
    {deblog(ex);}
}

function removeOperatorListContextMenu() {
    $('#operator-list-context').remove();
    //lzm_chatDisplay.createOperatorList();
}

function openChatMemberContextMenu(e, id, groupId, userId, browserId, chatId) {
    e.stopPropagation();
    selectChatMemberLine(id, groupId);
    var scrolledDownY = $('#chat-container').scrollTop();
    var scrolledDownX = $('#chat-container').scrollLeft();
    var parentOffset = $('#chat-container').offset();
    var yValue = e.pageY - parentOffset.top + scrolledDownY-10;
    var xValue = e.pageX - parentOffset.left + scrolledDownX+30;
    lzm_chatDisplay.showContextMenu('chat-members', {groupId: groupId, userId: userId, browserId: browserId, chatId: chatId, parent: 'chat-table'}, xValue, yValue);
    e.preventDefault();
}

function selectChatMemberLine(lineId, groupId){
    removeChatMembersListContextMenu();
    $('.'+groupId).removeClass('selected-chat-member-div');
    $('#'+lineId).addClass('selected-chat-member-div');
}

function removeChatMembersListContextMenu() {
    $('#chat-members-context').remove();
}

function toggleIndividualGroupStatus(groupId, action) {
    lzm_chatDisplay.newGroupsAway = (lzm_chatDisplay.newGroupsAway != null) ?
        lzm_commonTools.clone(lzm_chatDisplay.newGroupsAway) :
        (lzm_chatDisplay.myGroupsAway != null) ? lzm_commonTools.clone(lzm_chatDisplay.myGroupsAway) : [];
    if (action == 'add') {
        if ($.inArray(groupId, lzm_chatDisplay.newGroupsAway) == -1) {
            lzm_chatDisplay.newGroupsAway.push(groupId);
        }
    } else {
        var tmpArray = [];
        for (var i=0;i<lzm_chatDisplay.newGroupsAway.length; i++) {
            if (lzm_chatDisplay.newGroupsAway[i] != groupId) {
                tmpArray.push(lzm_chatDisplay.newGroupsAway[i]);
            }
        }
        lzm_chatDisplay.newGroupsAway = lzm_commonTools.clone(tmpArray);
    }
    DataEngine.operators.setOperatorProperty(lzm_chatDisplay.myId, 'groupsAway', lzm_chatDisplay.newGroupsAway);
    removeOperatorListContextMenu();
}

function signOffOperator(operatorId) {
    if (DataEngine.operators.getOperator(lzm_chatDisplay.myId).level == 1) {
        var operator = DataEngine.operators.getOperator(operatorId);
        if (operator != null)
            CommunicationEngine.pollServerSpecial({oid: operator.id, ouid: operator.userid}, 'operator-sign-off');
    }
    else
        showNoAdministratorMessage();
}

/**************************************** Editor functions ****************************************/
function initEditor(myText, caller, cpId) {
    cpId = (typeof cpId != 'undefined' && cpId != '') ? cpId : ChatManager.ActiveChat;
    if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        setEditorContents(myText);
    }
    else
    {
        chatMessageEditorIsPresent = true;
        lzm_chatInputEditor.init(myText, 'initEditor_' + caller, cpId);
    }
}

function removeEditor() {
    if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        // do nothing here
    }
    else
    {
        chatMessageEditorIsPresent = false;
        lzm_chatInputEditor.removeEditor();
    }
}

function setFocusToEditor() {

    ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        $('#chat-input').focus();
    }
}

function grabEditorContents() {
    if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        return $('#chat-input').val();
    }
    else
    {
        return lzm_chatInputEditor.grabHtml();
    }
}

function setEditorContents(myText) {
    if((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
        $('#chat-input').val(myText);
    else
        lzm_chatInputEditor.setHtml(myText)

}

function clearEditorContents(os, browser, caller) {

    if((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        $('#chat-input').val('');
    }
    else
        lzm_chatInputEditor.clearEditor(os, browser);
}

function setEditorDisplay(myDisplay) {

    if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
        $('#chat-input').css({display: myDisplay});
    else
        $('#chat-input-body').css({display: myDisplay});
}

function moveCaretToEnd(el) {
    if (typeof el.selectionStart == "number") {
        el.selectionStart = el.selectionEnd = el.value.length;
    } else if (typeof el.createTextRange != "undefined") {
        el.focus();
        var range = el.createTextRange();
        range.collapse(false);
        range.select();
    }
}

function insertAtCursor(myField, myValue) {
    myField = document.getElementById(myField);
    //IE support
    if (document.selection) {
        myField.focus();
        var sel = document.selection.createRange();
        sel.text = myValue;

    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}

/**************************************** Geotracking map functions ****************************************/
var lzmMessageReceiver = null;

function setMapType(myType) {
    lzm_chatGeoTrackingMap.setMapType(myType);
    lzm_chatGeoTrackingMap.selectedMapType = myType;
    $('#geotracking-footline').html(lzm_displayHelper.createGeotrackingFootline());
}

function zoomMap(direction) {
    lzm_chatGeoTrackingMap.zoom(direction);
}

/**************************************** Some stuff done on load of the chat page ****************************************/
$(document).ready(function () {

    runningInIframe = (window.self !== window.top);
    lzm_displayHelper = new ChatDisplayHelperClass();
    lzm_inputControls = new CommonInputControlsClass();
    UIRenderer = new UIRendererClass();

    getCredentials();

    lzm_displayHelper.blockUi({message: null});

    IFManager.InitDeviceInterface();

    if (IFManager.IsAppFrame)
    {
        var tmpDeviceId = IFManager.IFLoadDeviceId();
        if (tmpDeviceId != 0)
        {
            deviceId = tmpDeviceId;
        }
    }
    if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        var chatInputTextArea = document.getElementById("chat-input");
        chatInputTextArea.onfocus = function() {
            moveCaretToEnd(chatInputTextArea);
            // Work around Chrome issue
            window.setTimeout(function() {
                moveCaretToEnd(chatInputTextArea);
            }, 1);
        };
    }
    lzm_commonConfig = new CommonConfigClass();
    lzm_commonTools = new CommonToolsClass();
    lzm_commonPermissions = new CommonPermissionClass();
    lzm_commonStorage = new CommonStorageClass(localDbPrefix);
    lzm_chatTimeStamp = new ChatTimestampClass(0);

    var userConfigData = {
        userVolume: chosenProfile.user_volume,
        awayAfter: (typeof chosenProfile.user_away_after != 'undefined') ? chosenProfile.user_away_after : 0,
        language: (typeof chosenProfile.language != 'undefined') ? chosenProfile.language : 'en',
        backgroundMode: (typeof chosenProfile.background_mode != 'undefined') ? chosenProfile.background_mode : 1
    };

    lzm_chatInputEditor = new ChatEditorClass('chat-input');
    lzm_chatDisplay = new CommonUIClass(lzm_chatTimeStamp.getServerTimeString(), lzm_commonConfig, lzm_commonTools, lzm_chatInputEditor, messageTemplates, userConfigData, multiServerId);
    lzm_commonDialog = new CommonDialogClass();
    DataEngine = new ChatServerEvaluationClass(lzm_commonTools, chosenProfile, lzm_chatTimeStamp);
    CommunicationEngine = new ChatPollServerClass(lzm_commonConfig, lzm_commonTools, lzm_chatDisplay, lzm_commonStorage, chosenProfile, userStatus);
    lzm_t = new CommonTranslationClass(chosenProfile.server_protocol, chosenProfile.server_url, chosenProfile.mobile_dir, false, chosenProfile.language);
    lzm_t.setTranslationData(translationData);
    UserActions = new ChatUserActionsClass(lzm_commonTools, CommunicationEngine, lzm_chatDisplay, DataEngine, lzm_t, lzm_commonStorage, lzm_chatInputEditor, chosenProfile);
    lzm_chatGeoTrackingMap = new ChatGeotrackingMapClass();

    lzmMessageReceiver = function(_event) {
        if (_event.origin == lzm_chatGeoTrackingMap.receiver)
        {
            switch(_event.data.function)
            {
                case 'get-url':
                    lzm_chatGeoTrackingMap.urlIsSet = true;
                    break;
                case 'get-visitor':

                    lzm_chatGeoTrackingMap.selectedVisitor = _event.data.params;
                    VisitorManager.SelectedVisitor = _event.data.params;
                    selectVisitor(null,_event.data.params,true);
                    $('#geotracking-footline').html(lzm_displayHelper.createGeotrackingFootline());
                    break;
                case 'get-zoomlevel':
                    lzm_chatGeoTrackingMap.zoomLevel = _event.data.params;
                    break;
                default:
                    deblog('Unknown message received: ' + JSON.stringify(_event.data));
                    break;
            }
        }
    };
    if (window.addEventListener)
        window.addEventListener('message', lzmMessageReceiver, false);
    else
        window.attachEvent('onmessage', lzmMessageReceiver);

    DataEngine.setUserLanguage(lzm_t.language);
    lzm_chatDisplay.userLanguage = lzm_t.language;
    UserActions.userLanguage = lzm_t.language;

    if (lzm_chatDisplay.viewSelectArray.length == 0) {
        lzm_chatDisplay.viewSelectArray = [];
        var viewSelectIdArray = Object.keys(lzm_chatDisplay.allViewSelectEntries);
        for (var i=0; i<viewSelectIdArray.length; i++)
            lzm_chatDisplay.viewSelectArray.push({id: viewSelectIdArray[i], name: lzm_chatDisplay.allViewSelectEntries[viewSelectIdArray[i]].title, icon: lzm_chatDisplay.allViewSelectEntries[viewSelectIdArray[i]].icon});
    }
    lzm_chatDisplay.createMainMenuPanel();
    lzm_chatDisplay.createViewSelectPanel();
    lzm_chatDisplay.createChatWindowLayout(false);

    if (LocalConfiguration.TableColumns.visitor.length == 0) {
        LocalConfiguration.CreateTableArray('visitor', 'general', []);
    }
    if (LocalConfiguration.TableColumns.archive.length == 0) {
        LocalConfiguration.CreateTableArray('archive', 'general', []);
    }
    if (LocalConfiguration.TableColumns.ticket.length == 0) {
        LocalConfiguration.CreateTableArray('ticket', 'general', []);
    }
    if (LocalConfiguration.TableColumns.allchats.length == 0)
    {
        LocalConfiguration.CreateTableArray('allchats', 'general', []);
        lzm_commonTools.RemoveElementByProperty(LocalConfiguration.TableColumns.allchats,'cid','type');
    }

    CommunicationEngine.pollServerlogin(CommunicationEngine.chosenProfile.server_protocol,CommunicationEngine.chosenProfile.server_url);

    fillStringsFromTranslation();
    ChatTicketClass.m_TicketChannels = [
        {key:'web',index:0,title:tid('web')},
        {key:'email',index:1,title:tid('email')},
        {key:'phone',index:2,title:tid('phone')},
        {key:'misc',index:3,title:tid('misc')},
        {key:'chat',index:4,title:tid('chat')},
        {key:'rating',index:5,title:tid('feedback')},
        {key:'facebook',index:6,title:tid('facebook')},
        {key:'twitter',index:7,title:tid('twitter')}
    ];

    ChatTicketClass.m_TicketStatuses = [
        {key:'open',index:0,title:tid('ticket_status_0')},
        {key:'in_progress',index:1,title:tid('ticket_status_1')},
        {key:'closed',index:2,title:tid('ticket_status_2')},
        {key:'deleted',index:3,title:tid('ticket_status_3')}
    ];

    $(window).resize(function () {
        setTimeout(function() {
            lzm_chatDisplay.createViewSelectPanel();
            if (lzm_chatDisplay.selected_view == 'external') {
                //lzm_chatDisplay.VisitorsUI.UpdateVisitorList();
            }
            if (lzm_chatDisplay.selected_view == 'mychats')
                lzm_chatDisplay.DrawChatPanel();

            lzm_chatDisplay.createChatWindowLayout(false, false);
            setTimeout(function() {
                handleWindowResize(true);
                    setTimeout(function() {
                        handleWindowResize(true);
                    }, 500);
                if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
                {
                    setTimeout(function() {
                        handleWindowResize(false);
                    }, 2500);
                    setTimeout(function() {
                        handleWindowResize(false);
                    }, 10000);
                }
            }, 100);
        }, 10);
    });

    $('.logout_btn').click(function () {
        logout(true);
    });
    $('#stop_polling').click(function () {
        stopPolling();
    });
    $('#userstatus-button').click(function (e) {
        showUserStatusMenu(e);
    });
    $('#usersettings-button').click(function (e) {
        showUserSettingsMenu(e);
    });
    $('#wishlist-button').click(function() {
        openLink('http://wishlistmobile.livezilla.net/');
    });
    $('#blank-button').click(function() {
        if(debug) {
            debuggingStartStopPolling();
        }
    });
    $('.lzm-button').mouseenter(function() {
        $(this).css('background-image', $(this).css('background-image').replace(/linear-gradient\(.*\)/,'linear-gradient(#f6f6f6,#e0e0e0)'));
    });
    $('.lzm-button').mouseleave(function() {
        $(this).css('background-image', $(this).css('background-image').replace(/linear-gradient\(.*\)/,'linear-gradient(#ffffff,#f1f1f1)'));
    });

    $('body').click(function(e) {
        doBlinkTitle = false;
        $('#usersettings-menu').css({'display':'none'});
        lzm_chatDisplay.showUsersettingsHtml = false;
        $('#userstatus-menu').css({'display':'none'});
        lzm_chatDisplay.showUserstatusHtml = false;
        lzm_displayHelper.showMinimizedDialogsMenu(true);
        lzm_chatDisplay.RemoveAllContextMenus();
    });
    $('body').keydown(function(e) {

        var controlPressed = e.ctrlKey || e.metaKey;
        var keyCode = (typeof e.which != 'undefined') ? e.which : e.keyCode;
        if ($('#email-list').length > 0)
        {
            if(keyCode == 46)
                deleteEmail();
            else if(controlPressed && keyCode == 65){
                $('tr.email-list-line').addClass('selected-table-line');
                return false;
            }
        }
        if($('#search-ticket').is(":focus"))
            return;

        if ($('#ticket-list-body').length > 0 && !$('.dialog-window-container').length && !$('.lzm-alert-dialog-container').length && lzm_chatDisplay.selected_view == 'tickets')
        {
            if(!controlPressed)
            {
                switch(keyCode) {

                    case 79:
                        changeTicketStatus(0,null,null,null,true);
                        break;
                    case 80:
                        changeTicketStatus(1,null,null,null,true);
                        break;
                    case 67:
                        changeTicketStatus(2,null,null,null,true);
                        break;
                    case 46:
                    case 68:
                        changeTicketStatus(3,null,null,null,true);
                        break;
                    case 40:
                        selectTicket('next');
                        break;
                    case 38:
                        selectTicket('previous');
                        break;
                }
            }
            else if(keyCode == 65)
            {
                $('tr.ticket-list-row').addClass('selected-table-line');
                return false;
            }
        }
    });
    $('#new-view-select-panel').on('touchstart', function(e) {
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        vsPanelTouchPos = touch.pageX;
    });
    $('#new-view-select-panel').on('touchend', function(e) {
        if (vsPanelTouchPos != null) {
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            var xPos = touch.pageX;
            var xMove = vsPanelTouchPos - xPos;
            vsPanelTouchPos = null;
            if (xMove > 50) {
                moveViewSelectPanel('right');
            } else if (xMove < -50) {
                moveViewSelectPanel('left');
            }
        }
    });

    $('#chat-progress').on({
        dragenter: function() {
            addQrdToChat(3);
        }
    });

    $(window).on('beforeunload', function(){
        if (lzm_chatDisplay.askBeforeUnload)
            return t('Are you sure you want to leave or reload the client? You may lose data because of that.');
    });
    setTimeout("ChatSettingsClass.__CheckForUpdates();",15000);
});


