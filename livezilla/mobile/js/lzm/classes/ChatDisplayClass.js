/****************************************************************************************
 * LiveZilla CommonUIClass.js
 *
 * Copyright 2016 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function CommonUIClass(now, lzm_commonConfig, lzm_commonTools, lzm_chatInputEditor, messageTemplates, userConfigData, multiServerId) {
    this.debuggingDisplayMode = 'none';
    this.debuggingDisplayWidth = 0;

    this.m_OperatorsListLineCounter = 0;
    this.m_OperatorsListSelectedLine = 0;

    this.myLoginId = '';
    this.myId = '';
    this.myName = '';
    this.myEmail = '';
    this.myGroups = [];
    this.myGroupsAway = null;
    this.newGroupsAway = null;
    this.selected_view = '';
    this.lastChatSendingNotification = '';
    this.thisUser = {id: ''};
    this.soundPlayed = [];

    this.userLanguage = 'en';
    this.joinedChats = [];
    this.publicGroupChats = [];
    this.selectedResource = '';
    this.tabSelectedResources = ['1', '1', '1'];

    this.serverIsDisabled = false;
    this.lastDiabledWarningTime = 0;
    this.askBeforeUnload = true;

    this.startPages = {show_lz: '0', others: []};
    this.startPageTabControlDoesExist = false;
    this.startPageExists = false;
    this.awayAfterTime = userConfigData['awayAfter'];
    this.volume = userConfigData['userVolume'];

    this.vibrateNotifications = 1;
    this.ticketReadStatusChecked = 1;
    this.qrdAutoSearch = 1;
    this.alertNewFilter = 1;
    this.backgroundModeChecked = userConfigData['backgroundMode'];
    this.saveConnections = 0;

    if (IFManager.IsAppFrame && !IFManager.IsDesktopApp())
        IFManager.IFKeepActiveInBackgroundMode(this.backgroundModeChecked == 1);

    this.allViewSelectEntries = {home: {pos: 0, title: 'Startpage', icon: 'img/home-white.png'},
        mychats: {pos: 0, title: 'Chats', icon: ''}, tickets: {pos: 0, title: 'Tickets', icon: ''},
        external: {pos: 0, title: 'Visitors', icon: ''}, archive: {pos: 0, title: 'Chat Archive', icon: ''},
        internal: {pos: 0, title: 'Operators', icon: ''}, qrd: {pos: 0, title: 'Knowledge Base', icon: ''},
        reports: {pos: 1, title: 'Reports', icon: ''}};

    this.showViewSelectPanel = {home: 1, world: 1, mychats: 1, tickets: 1, external: 1, archive: 1, internal: 1, qrd: 1, report: 1};
    this.viewSelectArray = [];
    this.firstVisibleView = 'home';

    this.availableLanguages = {'aa':'Afar','ab':'Abkhazian','af':'Afrikaans','am':'Amharic','ar':'Arabic','as':'Assamese','ay':'Aymara','az':'Azerbaijani','ba':'Bashkir',
        'be':'Byelorussian','bg':'Bulgarian','bh':'Bihari','bi':'Bislama','bn':'Bengali','bo':'Tibetan','br':'Breton','ca':'Catalan','co':'Corsican','cs':'Czech','cy':'Welsh',
        'da':'Danish','de':'German','dz':'Bhutani','el':'Greek','en':'English','en-gb':'English (Great Britain)','en-us':'English (United States)','eo':'Esperanto','es':'Spanish',
        'et':'Estonian','eu':'Basque','fa':'Persian','fi':'Finnish','fj':'Fiji','fo':'Faeroese','fr':'French','fy':'Frisian','ga':'Irish','gd':'Gaelic','gl':'Galician','gn':'Guarani',
        'gu':'Gujarati','ha':'Hausa','he':'Hebrew','hi':'Hindi','hr':'Croatian','hu':'Hungarian','hy':'Armenian','ia':'Interlingua','id':'Indonesian','ie':'Interlingue','ik':'Inupiak',
        'is':'Icelandic','it':'Italian','ja':'Japanese','ji':'Yiddish','jw':'Javanese','ka':'Georgian','kk':'Kazakh','kl':'Greenlandic','km':'Cambodian','kn':'Kannada','ko':'Korean',
        'ks':'Kashmiri','ku':'Kurdish','ky':'Kirghiz','la':'Latin','ln':'Lingala','lo':'Laothian','lt':'Lithuanian','lv':'Latvian','mg':'Malagasy','mi':'Maori','mk':'Macedonian',
        'ml':'Malayalam','mn':'Mongolian','mo':'Moldavian','mr':'Marathi','ms':'Malay','mt':'Maltese','my':'Burmese','na':'Nauru','nb':'Norwegian (Bokmal)','ne':'Nepali','nl':'Dutch',
        'nn':'Norwegian (Nynorsk)','oc':'Occitan','om':'Oromo','or':'Oriya','pa':'Punjabi','pl':'Polish','ps':'Pashto','pt':'Portuguese','pt-br':'Portuguese (Brazil)','qu':'Quechua',
        'rm':'Rhaeto-Romance','rn':'Kirundi','ro':'Romanian','ru':'Russian','rw':'Kinyarwanda','sa':'Sanskrit','sd':'Sindhi','sg':'Sangro','sh':'Serbo-Croatian','si':'Singhalese',
        'sk':'Slovak','sl':'Slovenian','sm':'Samoan','sn':'Shona','so':'Somali','sq':'Albanian','sr':'Serbian','ss':'Siswati','st':'Sesotho','su':'Sudanese','sv':'Swedish','sw':'Swahili',
        'ta':'Tamil','te':'Tegulu','tg':'Tajik','th':'Thai','ti':'Tigrinya','tk':'Turkmen','tl':'Tagalog','tn':'Setswana','to':'Tonga','tr':'Turkish','ts':'Tsonga','tt':'Tatar','tw':'Twi',
        'uk':'Ukrainian','ur':'Urdu','uz':'Uzbek','vi':'Vietnamese','vo':'Volapuk','wo':'Wolof','xh':'Xhosa','yo':'Yoruba','zh':'Chinese','zh-cn':'Chinese (Simplified)',
        'zh-tw':'Chinese (Traditional)','zu':'Zulu'};


    this.searchButtonUpSet = {};
    this.storedSuperMenu = null;
    this.StoredDialogs = {};
    this.StoredDialogIds = [];
    this.dialogData = {};
    this.ticketListTickets = [];
    this.ticketControlTickets = [];
    this.archiveControlChats = [];
    this.ticket = {};
    this.showTicketContextMenu = false;
    this.showTicketMessageContextMenu = false;
    this.ticketDialogId = {};
    this.ticketResourceText = {};
    this.ticketReadArray = [];
    this.ticketUnreadArray = [];
    this.ticketGlobalValues = {t: -1, r: -1, mr: 0, updating: false};
    this.ticketFilterPersonal = 'hidden';
    this.ticketFilterGroup = 'hidden';
    this.selectedTicketRow = '';
    this.selectedTicketRowNo = 0;
    this.numberOfUnreadTickets = -1;
    this.emailReadArray = [];
    this.emailDeletedArray = [];
    this.ticketsFromEmails = [];
    this.recentlyUsedResources = [];
    this.showArchiveFilterMenu = false;
    this.showArchiveListContextMenu = false;
    this.archiveFilterChecked = ['visible', 'visible', 'visible'];
    this.showReportFilterMenu = false;
    this.showReportContextMenu = false;
    this.minimizedMemberLists = [];
    this.chatTranslations = {};
    this.translatedPosts = [];
    this.translationLanguages = [];
    this.translationLangCodes = [];
    this.translationServiceError = 'No translations fetched';
    this.lastPhoneProtocol = 'callto:';
    this.doNotUpdateOpList = false;
    this.newDynGroupHash = '';
    this.showUserstatusHtml = false;
    this.showUsersettingsHtml = false;
    this.showMinifiedDialogsHtml = false;
    this.windowWidth = 0;
    this.windowHeight = 0;
    this.initialWindowHeight = 0;
    this.chatPanelHeight = 0;
    this.blankButtonWidth = 0;
    this.showChatActionsMenu = false;
    this.showOpInviteDialog = false;
    this.translationEditor = new ChatTranslationEditorClass();
    this.reportsDisplay = new ChatReportsClass();
    this.settingsDisplay = new ChatSettingsClass();
    this.startpageDisplay = new ChatStartpageClass();
    this.resourcesDisplay = new KnowledgebaseUI();
    this.archiveDisplay = new ChatArchiveClass();
    this.VisitorsUI = new ChatVisitorClass();
    this.ticketDisplay = new ChatTicketClass();
    this.ChatsUI = new ChatUI();

    this.LinkGenerator = null;
    this.ServerConfigurationClass = null;
    this.EventConfiguration = null;
    this.FilterConfiguration = null;
    this.ChatForwardInvite = null;
    this.FeedbacksViewer = null;

    this.hiddenChats = [];
    this.validationErrorCount = 0;
    this.alertDialogIsVisible = false;

    this.memberListWidth = 150;

    this.HeartBeat = null;
    this.HeartBeatCounter = 0;
    this.SoundIntervalQueue = false;
    this.SoundIntervalRing = false;

    this.now = now;
    this.lzm_commonConfig = lzm_commonConfig;
    this.lzm_commonTools = lzm_commonTools;
    this.lzm_chatInputEditor = lzm_chatInputEditor;

    this.lzm_chatTimeStamp = {};

    this.messageTemplates = messageTemplates;
    this.multiServerId = multiServerId;

    this.chatPanelLineHeight = 26;
    this.activeChatPanelHeight = this.chatPanelLineHeight;
    this.dialogWindowWidth = 0;
    this.dialogWindowHeight = 0;
    this.FullscreenDialogWindowWidth = 0;
    this.FullscreenDialogWindowHeight = 0;
    this.dialogWindowLeft = 0;
    this.dialogWindowTop = 0;
    this.FullscreenDialogWindowLeft = 0;
    this.FullscreenDialogWindowTop = 0;
    this.dialogWindowContainerCss = {};
    this.dialogWindowCss = {};
    this.dialogWindowHeadlineCss = {};
    this.dialogWindowBodyCss = {};
    this.dialogWindowFootlineCss = {};
    this.FullscreenDialogWindowCss = {};
    this.FullscreenDialogWindowHeadlineCss = {};
    this.FullscreenDialogWindowBodyCss = {};
    this.FullscreenDialogWindowFootlineCss = {};

    this.DialogBorderRatioFull = 0.95;
    this.DialogBorderRatioHalf = 0.65;
    this.DialogBorderRatioInput = 0.35;

    this.browserName = 'other';
    if ($.browser.chrome)
        this.browserName = 'chrome';
    else if ($.browser.mozilla)
        this.browserName = 'mozilla';
    else if ($.browser.msie)
        this.browserName = 'ie';
    else if ($.browser.safari)
        this.browserName = 'safari';
    else if ($.browser.opera)
        this.browserName = 'opera';
    if ($.browser.version.indexOf('.') != -1) {
        this.browserVersion = $.browser.version.split('.')[0];
        this.browserMinorVersion = $.browser.version.split('.')[1];
    } else {
        this.browserVersion = $.browser.version;
        this.browserMinorVersion = 0;
    }

    if (this.browserName == 'mozilla' && this.browserVersion == 11)
        this.browserName = 'ie';

    lzm_displayHelper.browserName = this.browserName;
    lzm_displayHelper.browserVersion = this.browserVersion;
    lzm_displayHelper.browserMinorVersion = this.browserMinorVersion;
}

CommonUIClass.MinWidthChatVisitorInfo = 1200;
CommonUIClass.BlockUIUpdate = false;
CommonUIClass.LicenseMissing = false;
CommonUIClass.LicenseCheckPassed = false;
CommonUIClass.TranslateChatPost = null;
CommonUIClass.IsExternalAvailable = false;
CommonUIClass.IsOutsideOfOpeningHours = false;

CommonUIClass.prototype.resetWebApp = function() {
    this.validationErrorCount = 0;
    //this.StopIndication([]);
};

CommonUIClass.prototype.getActiveChatRealname = function(){
    return 'DEPRECATED getActiveChatRealname';
};

CommonUIClass.prototype.UpdateTabsUI = function() {

    function updateButtonTyping(bId,isTyping){
        var typingClass = 'lzm-tabs-typing';
        if(isTyping)
            $(bId).addClass(typingClass);
        else
            $(bId).removeClass(typingClass);
    }
    function updateButtonMessage(bId,isMessage){
        var messageClass = 'lzm-tabs-message';
        if(isMessage)
            $(bId).addClass(messageClass);
        else
            $(bId).removeClass(messageClass);
    }

    var isNew, logos = {Hidden:'img/lz_hidden.png',Online:'img/lz_online.png',Offline:'img/lz_offline.png'};
    var buttonId, isMessage, isTyping, logo = '';
    for (var key in DataEngine.ChatManager.Chats)
    {



        var chat = DataEngine.ChatManager.Chats[key];

        if(!chat.TabOpen)
            continue;

        isMessage = false;
        isTyping = false;
        isNew = (!chat.IsAccepted() && chat.GetStatus() != Chat.Closed && chat.Type == Chat.Visitor && chat.GetMember(DataEngine.myId) != null);

        if(isNew || chat.IsUnread)
            isMessage = true;
        else if(chat.IndicateTyping)
            isTyping = true;

        if(chat.Type == Chat.Visitor)
            logo = (chat.GetStatus() != Chat.Closed && chat.IsMember(DataEngine.myId) && !chat.HasDeclined(DataEngine.myId)) ? ((chat.IsHiddenMember(DataEngine.myId)) ? logos.Hidden : logos.Online) : logos.Offline;
        else if(chat.Type == Chat.Operator)
            logo = lzm_commonConfig.lz_user_states[DataEngine.operators.getOperator(chat.SystemId).status].icon;
        else
            logo='';

        buttonId = '#chat-button-' + chat.SystemId.replace(/~/,'_');
        $(buttonId).children('span').css({'background-image': "url('" + logo + "')", 'background-size': '14px 14px'});

        updateButtonTyping(buttonId,isTyping);
        updateButtonMessage(buttonId,isMessage);
    }

    UIRenderer.resizeMychats();
};

CommonUIClass.prototype.createChatWindowLayout = function (recreate, createChatPanel, ratio) {

    ratio = (typeof ratio != 'undefined') ? ratio :  this.DialogBorderRatioFull;

    var windowHeight = $(window).height();
    if (windowHeight >= this.initialWindowHeight) {
        this.initialWindowHeight = windowHeight;
    }

    if (recreate || UIRenderer.windowWidth != this.windowWidth || windowHeight != this.windowHeight ||
        this.activeChatPanelHeight < (this.chatPanelHeight - 5) ||
        this.activeChatPanelHeight > (this.chatPanelHeight + 5)) {
        this.chatPanelHeight = this.activeChatPanelHeight;

        if((UIRenderer.windowWidth <= 1000 || windowHeight <= 600) && ratio == this.DialogBorderRatioInput)
            ratio = this.DialogBorderRatioHalf;

        this.FullscreenDialogWindowWidth = (UIRenderer.windowWidth <= 600 || windowHeight <= 500) ? UIRenderer.windowWidth : Math.floor(ratio * UIRenderer.windowWidth) - 40;
        this.FullscreenDialogWindowHeight = (UIRenderer.windowWidth <= 600 || windowHeight <= 500) ? windowHeight : Math.floor(ratio * windowHeight) - 40;

        if (this.FullscreenDialogWindowWidth <= 600 || this.FullscreenDialogWindowHeight <= 500) {
            this.dialogWindowWidth = this.FullscreenDialogWindowWidth;
            this.dialogWindowHeight = this.FullscreenDialogWindowHeight;
        } else {
            this.dialogWindowWidth = 600;
            this.dialogWindowHeight = 500;
        }

        this.dialogWindowLeft = (this.dialogWindowWidth < UIRenderer.windowWidth) ? Math.floor((UIRenderer.windowWidth - this.dialogWindowWidth) / 2) : 0;
        this.FullscreenDialogWindowLeft = (this.FullscreenDialogWindowWidth < UIRenderer.windowWidth) ? Math.floor((UIRenderer.windowWidth - this.FullscreenDialogWindowWidth) / 2) : 0;
        this.dialogWindowTop = (this.dialogWindowHeight < windowHeight) ? Math.floor((windowHeight - this.dialogWindowHeight) / 2) : 0;
        this.FullscreenDialogWindowTop = (this.FullscreenDialogWindowHeight < windowHeight) ? Math.floor((windowHeight - this.FullscreenDialogWindowHeight) / 2) : 0;

        this.dialogWindowContainerCss = {
            position: 'absolute', left: '0px', bottom: '0px', width: UIRenderer.windowWidth+'px', height: windowHeight+'px',
            'background-color': 'rgba(0,0,0,0.75)', 'background-image': 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.02) 35px, rgba(255,255,255,.02) 70px)', 'z-index': '1001', overflow: 'hidden'
        };
        this.dialogWindowCss = {
            position: 'absolute', left: this.dialogWindowLeft+'px', bottom: this.dialogWindowTop+'px',
            width: this.dialogWindowWidth+'px', height: this.dialogWindowHeight+'px',
            'z-index': '1002'
        };
        this.dialogWindowHeadlineCss = {
            position: 'absolute', left: '0px', top: '0px',
            width: (this.dialogWindowWidth - 5)+'px', height: '20px'};

        this.dialogWindowBodyCss = {
            position: 'absolute', left: '0px', top: '27px',
            width: '100%'/*(this.dialogWindowWidth - 10)+'px'*/, height: (this.dialogWindowHeight - 65)+'px',
            padding: '0', 'text-shadow': 'none',
            'background-color': '#fff', 'overflow-y': 'auto', 'overflow-x': 'hidden'
        };
        this.dialogWindowFootlineCss = {
            position: 'absolute', left: '0px', top: (this.dialogWindowHeight - 38)+'px', 'border-top': '1px solid #ccc',
            width: (this.dialogWindowWidth - 6)+'px', height: '27px', 'text-align': 'right',
            padding: '10px 6px 0px 0px', 'background-color': '#f5f5f5'
        };

        this.FullscreenDialogWindowCss = {
            position: 'absolute', left: this.FullscreenDialogWindowLeft+'px', bottom: this.FullscreenDialogWindowTop+'px',
            width: this.FullscreenDialogWindowWidth+'px', height: this.FullscreenDialogWindowHeight+'px',
            'z-index': '1002'
        };
        this.FullscreenDialogWindowHeadlineCss = {
            position: 'absolute', left: '0px', top: '0px',
            width: (this.FullscreenDialogWindowWidth - 5)+'px', height: '20px'};
        this.FullscreenDialogWindowBodyCss = {
            position: 'absolute', left: '0px', top: '27px',
            width: '100%', height: (this.FullscreenDialogWindowHeight - 65)+'px',
            padding: '0',
            'background-color': '#FFFFFF', 'overflow-y': 'auto', 'overflow-x': 'hidden'
        };
        this.FullscreenDialogWindowFootlineCss = {
            position: 'absolute', left: '0px', top: (this.FullscreenDialogWindowHeight - 38)+'px', 'border-top': '1px solid #ccc',
            width: (this.FullscreenDialogWindowWidth - 6)+'px', height: '27px', 'text-align': 'right',
            padding: '10px 6px 0px 0px', 'background-color': '#f5f5f5'
        };


        $('.dialog-window-container').css(this.dialogWindowContainerCss);
        $('.dialog-window').css(this.dialogWindowCss);
        $('.dialog-window-headline').css(this.dialogWindowHeadlineCss);
        $('.dialog-window-body').css(this.dialogWindowBodyCss);
        $('.dialog-window-footline').css(this.dialogWindowFootlineCss);
        $('.dialog-window-fullscreen').css(this.FullscreenDialogWindowCss);
        $('.dialog-window-headline-fullscreen').css(this.FullscreenDialogWindowHeadlineCss);
        $('.dialog-window-body-fullscreen').css(this.FullscreenDialogWindowBodyCss);
        $('.dialog-window-footline-fullscreen').css(this.FullscreenDialogWindowFootlineCss);

        $('#debugging-messages').css({
            position: 'absolute',
            top: Math.floor(0.3 * $(window).height())+'px',
            left: Math.floor(0.3 * UIRenderer.windowWidth)+'px',
            width: Math.floor(0.4 * UIRenderer.windowWidth)+'px',
            height: Math.floor(0.4 * $(window).height())+'px',
            padding: '10px',
            'background-color': '#ffffc6',
            opacity: '0.9',
            display: this.debuggingDisplayMode,
            'z-index': 1000
        });

        this.windowWidth = UIRenderer.windowWidth;
        this.windowHeight = windowHeight;
    }

    UIRenderer.resizeAll();

    this.toggleVisibility('resize');
    if (this.selected_view == 'home' && this.startPageExists)
    {
        this.startpageDisplay.createStartPage(false, [], []);
    }
};

CommonUIClass.prototype.toggleVisibility = function (foo) {
    var that = this;
    var setCssDisplay = function(elt, displayMode) {
        if (typeof elt != 'undefined' && elt.length > 0 && elt.css('display') != displayMode) {
            elt.css({display: displayMode});
        }
    };

    var thisOperatorList = $('#operator-list');
    var thisTicketList = $('#ticket-list');
    var thisArchive = $('#archive');
    var thisStartPage = $('#startpage');
    var thisChat = $('#chat');
    var thisChatContainer = $('#chat-container');
    var thisErrors = $('#errors');
    var thisChatTable = $('#chat-table');
    var thisActiveChatPanel = $('#active-chat-panel');
    var thisVisitorList = $('#visitor-list');
    var thisQrdTree = $('#qrd-tree');
    var thisFilter = $('#filter');
    var thisAllChats = $('#all-chats');
    var thisReportList = $('#report-list');

    setCssDisplay(thisStartPage, 'none');
    setCssDisplay(thisOperatorList, 'none');
    setCssDisplay(thisTicketList, 'none');
    setCssDisplay(thisArchive, 'none');
    setCssDisplay(thisErrors, 'none');
    setCssDisplay(thisVisitorList, 'none');
    setCssDisplay(thisQrdTree, 'none');
    setCssDisplay(thisFilter, 'none');
    setCssDisplay(thisReportList, 'none');

    if (that.selected_view != 'mychats') {
        setCssDisplay($('#chat-progress'), 'none');
        setCssDisplay($('#chat-qrd-preview'), 'none');
        setCssDisplay($('#chat-action'), 'none');
        setCssDisplay($('#chat-buttons'), 'none');
        setCssDisplay(thisChatContainer, 'none');
        setCssDisplay(thisChatTable, 'none');
        setCssDisplay(thisActiveChatPanel, 'none');
        setCssDisplay(thisChat, 'block');
        setCssDisplay(thisAllChats, 'none');
    }
    switch (this.selected_view)
    {
        case 'mychats':
            setCssDisplay(thisChat, 'block');
            setCssDisplay(thisChatContainer, 'block');
            setCssDisplay(thisChatTable, 'block');
            setCssDisplay(thisAllChats, 'none');
            setCssDisplay($('#chat-progress'), 'block');
            if (ChatManager.ActiveChat!='LIST')
            {
                setCssDisplay($('#chat-qrd-preview'), 'block');
                setCssDisplay($('#chat-action'), 'block');
                setCssDisplay($('#chat-buttons'), 'block');
            } else {
                setCssDisplay($('#chat-qrd-preview'), 'none');
                setCssDisplay($('#chat-action'), 'none');
                setCssDisplay($('#chat-buttons'), 'none');
            }

            setCssDisplay(thisActiveChatPanel, 'block');
            break;
        case 'internal':
            setCssDisplay(thisOperatorList, 'block');
            break;
        case 'external':
            setCssDisplay(thisVisitorList, 'block');
            break;
        case 'qrd':

            setCssDisplay(thisQrdTree, 'block');
            break;
        case 'tickets':

            setCssDisplay(thisTicketList, 'block');
            break;
        case 'archive':
            setCssDisplay(thisArchive, 'block');

            break;
        case 'home':
            setCssDisplay(thisStartPage, 'block');

            break;
        case 'reports':
            setCssDisplay(thisReportList, 'block');
            break;
    }
};

CommonUIClass.prototype.logoutOnValidationError = function (validationError) {
    var loginPage, that = this,  alertString = '';

    if (this.validationErrorCount == 0 && $.inArray(validationError, ['3', '101']) == -1)
    {
        tryNewLogin(false);
        this.validationErrorCount++;
    }
    else if (validationError == '3')
    {
        if (!this.alertDialogIsVisible) {
            alertString = tid('logged_off');
            lzm_commonDialog.createAlertDialog(alertString, [{id: 'ok', name: t('Ok')}]);
            this.alertDialogIsVisible = true;
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
                that.askBeforeUnload = false;
                if (!IFManager.IsAppFrame)
                {
                    loginPage = 'index.php?LOGOUT';
                    window.location.href = loginPage;
                }
                else
                {
                    IFManager.IFOpenLoginView();
                }
                that.validationErrorCount++;
                that.alertDialogIsVisible = false;
            });
        }
    }
    else if (this.validationErrorCount == 1)
    {
        this.askBeforeUnload = false;
        var noLogout = false;
        if (!this.alertDialogIsVisible) {
            switch (validationError) {
                case '0':
                    alertString = t('Wrong username or password.');
                    break;
                case '2':
                    alertString = t('The operator <!--op_login_name--> is already logged in.',[['<!--op_login_name-->', this.myLoginId]]);
                    break;
                case '3':
                    alertString = tid('logged_off');
                    break;
                case "4":
                    alertString = t('Session timed out.');
                    break;
                case "5":
                    alertString = t('Your password has expired. Please enter a new password.');
                    break;
                case "9":
                    alertString = t('You are not an administrator.');
                    break;
                case "10":
                    alertString = tid('server_deactivated') + '\n' + tid('server_deactivated_undo');
                    break;
                case "13":
                    alertString = t('There are problems with the database connection.');
                    break;
                case "14":
                    alertString = t('This server requires secure connection (SSL). Please activate HTTPS in the server profile and try again.');
                    break;
                case "15":
                    alertString = t('Your account has been deactivated by an administrator.');
                    break;
                case "19":
                    alertString = t('No mobile access permitted.');
                    break;
                default:
                    alertString = 'Validation Error : ' + validationError;
                    break;
            }
            lzm_commonDialog.createAlertDialog(alertString.replace(/\n/g, '<br />'), [{id: 'ok', name: t('Ok')}]);
            this.alertDialogIsVisible = true;
            $('#alert-btn-ok').click(function() {
                if (!noLogout)
                {
                    that.askBeforeUnload = false;
                    if (!IFManager.IsAppFrame)
                    {
                        loginPage = 'index.php?LOGOUT';
                        window.location.href = loginPage;
                    }
                    else
                        IFManager.IFOpenLoginView();
                }
                else
                    that.validationErrorCount = 0;
                that.validationErrorCount++;
                that.alertDialogIsVisible = false;
            });
        }
    }
};

CommonUIClass.prototype.createGeoTracking = function() {

    if ($('#geotracking-iframe').length == 0)
    {
        $('#geotracking-body').html('<iframe id="geotracking-iframe" src=""></iframe>');
        $('#geotracking-body').data('src', '');
        $('#geotracking-footline').html(lzm_displayHelper.createGeotrackingFootline());
    }

};

CommonUIClass.prototype.createErrorHtml = function (global_errors) {
    var errorHtmlString = '';
    for (var errorIndex = 0; errorIndex < global_errors.length; errorIndex++) {
        errorHtmlString += '<p>' + global_errors[errorIndex] + '</p>';
        try {
            deblog(global_errors[errorIndex]);
        } catch(e) {}
    }
    $('#errors').html(errorHtmlString);
};

CommonUIClass.prototype.createOperatorList = function () {

    var that=this,onlineOnly = lzm_commonStorage.loadValue('op_list_onlonl_' + DataEngine.myId)=='1',showElements = lzm_commonStorage.loadValue('op_list_elements_' + DataEngine.myId)=='1';

    this.m_OperatorsListLineCounter = 0;
    if (!this.doNotUpdateOpList)
    {
        var operators = null;
        var internalChatsAreDisabled = (this.myGroups.length > 0);
        for (i=0; i<this.myGroups.length; i++)
        {
            var myGr = DataEngine.groups.getGroup(this.myGroups[i]);
            if (myGr != null && (typeof myGr.internal == 'undefined' || myGr.internal == '1'))
                internalChatsAreDisabled = false;
        }

        var intUserHtmlString = '<div class="lzm-dialog-headline2" style="top:0;"><span style="float:right;"><table class="tight vtight"><tr>' +
            '<td>' +  lzm_inputControls.createCheckbox('operator-list-display',tid('by_groups'),!showElements) + '</td>' +
            '<td>' +  lzm_inputControls.createCheckbox('operator-list-offline',tid('show_offline'),!onlineOnly) +'</td>' +
            '</tr></table></span></div><div id="operator-list-body"><table id="operator-list-table">';


        intUserHtmlString += this.createOperatorListLine('group',{id:'everyoneintern',name:tid('all_operators')},showElements);
        this.m_OperatorsListLineCounter++;

        var groups = DataEngine.groups.getGroupList('name', false, false);

        for (var i=0; i<groups.length; i++) {
            operators = DataEngine.operators.getOperatorList('name', groups[i].id, true);
            var showThisGroup = !internalChatsAreDisabled;
            if ($.inArray(groups[i].id, this.myGroups) != -1)
                showThisGroup = true;

            if (showThisGroup &&  (operators.length > 0 || (d(groups[i].o) && groups[i].o == this.myId))) {

                intUserHtmlString += this.createOperatorListLine('group',groups[i],showElements);
                this.m_OperatorsListLineCounter++;

                if(!showElements)
                {
                    if (d(groups[i].members)) {
                        for (var k=0; k<groups[i].members.length; k++)
                            if (groups[i].members[k].i.indexOf('~') != -1) {
                                var visitorId = groups[i].members[k].i.split('~')[0];
                                var visitor = VisitorManager.GetVisitor(visitorId);
                                if (visitor != null && d(visitor.b))
                                {
                                    intUserHtmlString += this.createOperatorListLine('visitor',{uid:groups[i].members[k].i.replace('~','-'),id:groups[i].id,name:VisitorManager.GetVisitorName(visitor)},showElements);
                                    this.m_OperatorsListLineCounter++;
                                }
                            }
                    }
                    intUserHtmlString += this.createUsersList(groups[i],operators,internalChatsAreDisabled,onlineOnly,this.m_OperatorsListSelectedLine);
                }
            }
        }

        if(showElements)
        {
            intUserHtmlString += '<tr><td colspan="5"></td></tr>';
            operators = DataEngine.operators.getOperatorList('name', '', true);
            intUserHtmlString += this.createUsersList({id:''},operators,internalChatsAreDisabled,onlineOnly,this.m_OperatorsListSelectedLine);
        }
        intUserHtmlString += '</table></div>';

        var tempScrollTop = $('#operator-list-body').scrollTop();
        $('#operator-list').html(intUserHtmlString);
        UIRenderer.resizeOperatorList();

        $('#operator-list-body').scrollTop(tempScrollTop);
        $('#operator-list-display').change(function(){
            lzm_commonStorage.saveValue('op_list_elements_' + DataEngine.myId,$('#operator-list-display').prop('checked')?'0':'1');
            that.createOperatorList();
        });
        $('#operator-list-offline').change(function(){
            lzm_commonStorage.saveValue('op_list_onlonl_' + DataEngine.myId,$('#operator-list-offline').prop('checked')?'0':'1');
            that.createOperatorList();
        });
    }
};

CommonUIClass.prototype.createOperatorListLine = function(type,obj) {
    var onclickAction='',oncontextmenuAction,selectedLine='',gtitle,ginfo,lineId='',gticon,gbg;
    if(type == 'group')
    {
        lineId = 'operator-list-line-'+obj.id + '_' + this.m_OperatorsListLineCounter;
        onclickAction = ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) ? ' onclick="openOperatorListContextMenu(event, \'group\', \'' + obj.id + '\',\'' + lineId + '\', \'\', \'' + this.m_OperatorsListLineCounter + '\');"' : ' onclick="selectOperatorLine(\'' + lineId + '\', \'' + this.m_OperatorsListLineCounter + '\',\'' + obj.id + '\',\'' + obj.id + '\',\'' + lz_global_base64_url_encode(obj.name) + '\', true);"';
        oncontextmenuAction = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="openOperatorListContextMenu(event, \'group\', \'' + obj.id + '\',\'' + lineId + '\', \'everyoneintern\', \'' + this.m_OperatorsListLineCounter + '\');"' : '';
        selectedLine = (parseInt(this.m_OperatorsListSelectedLine)==parseInt(this.m_OperatorsListLineCounter)) ? ' selected-table-line' : '';
        gtitle = obj.name;
        ginfo = (!d(obj.i) || $('#operator-list').width() < 500) ? '' : '<span>' + tid('dyn_group') + '</span>';
        gticon = (d(obj.i)) ? '<i class="fa fa-comments-o icon-light icon-large"></i>' : '';
        gbg = (d(obj.i)) ? ' operator-list-dynamic' : '';
        return '<tr id="'+lineId+'" class="operator-list-line'+selectedLine+gbg+'" ' + onclickAction + oncontextmenuAction + '><th class="lzm-unselectable" colspan="3"><span>' + gtitle + '</span></th><th>'+ginfo+'</th><th>'+gticon+'</i></th></tr>';

    }
    else if(type == 'visitor')
    {
        lineId = 'operator-list-line-'+obj.uid + '_ex_' + this.m_OperatorsListLineCounter;
        onclickAction = ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) ? ' onclick="openOperatorListContextMenu(event, \'visitor\', \'' + obj.uid + '\',\'' + lineId + '\', \'' + obj.id + '\', \'' + this.m_OperatorsListLineCounter + '\');"' : ' onclick="selectOperatorLine(\'' + lineId + '\', \'' + this.m_OperatorsListLineCounter + '\',\'' + obj.id + '\',\'' + obj.id + '\',\'' + lz_global_base64_url_encode(obj.name) + '\', true);"';
        oncontextmenuAction = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="openOperatorListContextMenu(event, \'visitor\', \'' + obj.uid + '\',\'' + lineId + '\', \'' + obj.id + '\', \'' + this.m_OperatorsListLineCounter + '\');"' : '';
        selectedLine = (parseInt(this.m_OperatorsListSelectedLine)==parseInt(this.m_OperatorsListLineCounter)) ? ' selected-table-line' : '';
        return '<tr id="' + lineId + '" class="operator-list-line'+selectedLine+'" ' + onclickAction + oncontextmenuAction + '><td class="lzm-unselectable userlist" style=""><i class="fa fa-user icon-light icon-large" style="padding-right:3px;"></i></td><td>' + lzm_inputControls.createAvatarField('avatar-box-small avatar-box-blue') + '</td><td colspan="3"><i>' + obj.name + '</i></td></tr>';
    }
    return '';
};

CommonUIClass.prototype.createUsersList = function (group,operators,internalChatsAreDisabled,onlineOnly,selectedLine,tableId,clickFunc,contFunc,dbcFunc) {
    clickFunc = (d(clickFunc)) ? clickFunc : 'selectOperatorLine';
    contFunc = (d(contFunc)) ? contFunc : 'openOperatorListContextMenu';
    dbcFunc = (d(dbcFunc)) ? dbcFunc : 'chatInternalWith';
    tableId = (d(tableId)) ? tableId : '';
    var onclickAction = '', ondblclickAction = '', ccount, oncontextmenuAction = '', i = 0,intUserHtmlString = '',selectedLine='',lineId ='';
    for (var j=0; j<operators.length; j++)
        if(!onlineOnly || operators[j].status!=2)
            if (!internalChatsAreDisabled || operators[j].id == this.myId) {
                var operatorLogo = operators[j].logo;
                var avcol = (operators[j].status==2) ? '-gray' : (operators[j].status==0) ? '-green' : '-orange';
                if (operators[j].status != 2 && $.inArray(group.id, operators[j].groupsAway) != -1) {
                    operatorLogo = 'img/lz_away.png';
                    avcol = '-orange';
                }

                if(operators[j].isbot)
                    avcol = '-purple';

                lineId = 'operator-'+ tableId +'list-line-'+operators[j].id + '_' + this.m_OperatorsListLineCounter;
                onclickAction = ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp()) ? ' onclick="'+contFunc+'(event, \'operator\', \'' + operators[j].id + '\',\'' + lineId + '\', \'' + group.id + '\', \'' + this.m_OperatorsListLineCounter + '\');"' : ' onclick="'+clickFunc+'(\'' + lineId + '\', \'' + this.m_OperatorsListLineCounter + '\',\'' + operators[j].id + '\',\'' + operators[j].userid + '\',\'' + lz_global_base64_url_encode(operators[j].name) + '\', true);"';
                ondblclickAction = (((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) && !internalChatsAreDisabled) ? ' ondblclick="'+dbcFunc+'(\'' + operators[j].id + '\',\'' + operators[j].userid + '\',\'' + operators[j].name + '\', true);"' : '';
                oncontextmenuAction = (((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) && contFunc.length) ? ' oncontextmenu="'+contFunc+'(event, \'operator\', \'' + operators[j].id + '\',\'' + lineId + '\', \'' + group.id + '\', \'' + this.m_OperatorsListLineCounter + '\');"' : '';
                selectedLine = (parseInt(selectedLine)==parseInt(this.m_OperatorsListLineCounter)) ? ' selected-table-line' : '';

                intUserHtmlString += '<tr id="operator-'+ tableId +'list-line-' + operators[j].id + '_' + this.m_OperatorsListLineCounter + '" data-id="'+operators[j].id+'" class="operator-'+ tableId +'list-line'+selectedLine+'" ' + onclickAction + oncontextmenuAction + '>' +
                    '<td class=""><span class="operator-list-icon" style="background-image: url(\'' + operatorLogo + '\');"></span></td><td class="">'+lzm_inputControls.createAvatarField('avatar-box-small avatar-box','',operators[j].id)+'</div></td>';

                ccount = (operators[j].status != '2') ? ' <span class="lzm-info-text">(' + DataEngine.ChatManager.GetChatsOf(operators[j].id,[Chat.Active,Chat.Open]).length.toString() + ' ' + tid('chats') + ')</span>' : '';

                intUserHtmlString += '<td class="lzm-unselectable">' + operators[j].name + ccount + '</td><td>';

                if(operators[j].status == '2' && $('#operator-list').width() > 500){
                    var laString = '';
                    if(operators[j].la>0)
                        laString = tidc('last_online',': ') + lzm_commonTools.getHumanDate(lzm_chatTimeStamp.getLocalTimeObject(parseInt(operators[j].la * 1000), true), '', lzm_chatDisplay.userLanguage) + ' ';
                    intUserHtmlString += '<span class="text-s">'+laString+'</span>';
                }

                intUserHtmlString += '</td><td>';

                if ((operators[j].mobileAccount && operators[j].status == '2'))
                    intUserHtmlString += '<i class="fa fa-tablet icon-light icon-large"></i>';
                else if (operators[j].clientMobile && operators[j].status != '2' && !IFManager.IsDesktopApp(operators[j].appOS))
                    intUserHtmlString += '<i class="fa fa-tablet icon-light icon-large"></i>';

                if (operators[j].level==1)
                    intUserHtmlString += '<i class="fa fa-star-o icon-light icon-large" title="'+tid('admin')+'"></i>';

                intUserHtmlString += '</td></tr>';
                this.m_OperatorsListLineCounter++;
            }
    return intUserHtmlString;
};

CommonUIClass.prototype.createPublicGroup = function () {
    this.doNotUpdateOpList = true;
    this.newDynGroupHash = md5(String(Math.random())).substr(0, 10);
    var input = '<label>'+tidc('group_name')+'</label><input type="text" id="new-dynamic-group-name" data-role="none" class="lzm-text-input" autofocus />';
    lzm_commonDialog.createAlertDialog(input, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
    $('#new-dynamic-group-name').focus();
    $('#alert-btn-cancel').click(function(e) {
        lzm_commonDialog.removeAlertDialog();
    });
    $('#alert-btn-ok').click(function(e) {
        saveNewDynamicGroup();
        lzm_commonDialog.removeAlertDialog();
    });
};

CommonUIClass.prototype.addToChatGroup = function (id, browserId, chatId) {
    var accChat=false, headerString = tid('group_chat_add');
    var bodyString = lzm_displayHelper.createAddToDynamicGroupHtml(id, browserId);
    var footerString = lzm_inputControls.createButton('save-dynamic-group', '', '', t('Ok'), '', 'lr',{'margin-left': '4px'},'',30,'d') +
        lzm_inputControls.createButton('cancel-dynamic-group', '', '', t('Close'), '', 'lr',{'margin-left': '4px'},'',30,'d');
    var dialogData = {};
    lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'dynamic-group', {}, {}, {}, {}, '', dialogData, false, false);
    UIRenderer.resizeDynamicGroupDialogs();

    selectChatGroup($('#dynamic-group-table').data('selected-group'));
    $('#save-dynamic-group').click(function()   {
        lzm_chatDisplay.ChatsUI.EditorBlocked = false;
        if ($('#create-new-group').attr('checked') == 'checked')
        {
            UserActions.SaveChatGroup('create-add', '', $('#new-group-name').val(), id,{isPersistent: $('#persistent-group-member').attr('checked') == 'checked', browserId: browserId, chatId: chatId});
            accChat = true;
        }
        else
        {
            var group = DataEngine.groups.getGroup($('#dynamic-group-table').data('selected-group'));
            if (lzm_commonPermissions.checkUserPermissions(lzm_chatDisplay.myId, 'group', '', group)) {
                var isAlreadyInGroup = false;
                for (var i=0; i<group.members.length; i++)
                {
                    isAlreadyInGroup = (group.members[i].i == id) ? true : isAlreadyInGroup;
                }
                if (!isAlreadyInGroup)
                {
                    UserActions.SaveChatGroup('add', $('#dynamic-group-table').data('selected-group'), '', id,{isPersistent: $('#persistent-group-member').attr('checked') == 'checked', browserId: browserId, chatId: chatId});
                    accChat = true;

                    var chatObj = DataEngine.ChatManager.GetChat(chatId,'i');
                    if(chatObj != null)
                    {
                        chatObj.CloseChatTab();
                        OpenChatTab(group.id);
                    }
                }
                else
                {
                    var alertText =  t('A user with this name already exists in this group.');
                    lzm_commonDialog.createAlertDialog(alertText, [{id: 'ok', name: t('Ok')}]);
                    $('#alert-btn-ok').click(function() {
                        lzm_commonDialog.removeAlertDialog();
                    });
                }
            }
            else
                showNoPermissionMessage();
        }
        $('#cancel-dynamic-group').click();
        if(accChat && d(chatObj) && chatObj != null && chatObj.Type == Chat.Visitor && !chatObj.IsAccepted())
        {
            UserActions.AcceptChat(chatObj,false);
        }
    });
    $('#cancel-dynamic-group').click(function() {
        lzm_displayHelper.removeDialogWindow('dynamic-group');
    });
};

CommonUIClass.prototype.createOperatorListContextMenu = function(myObject) {
    var disabledClass, onclickAction, contextMenuHtml = '', checkVisibility = '', thisClass = this;
    var isBot = (d(myObject['chat-partner'].isbot) && myObject['chat-partner'].isbot == 1);
    var browserId = (typeof myObject.browser != 'undefined' && typeof myObject.browser.id != 'undefined') ? myObject.browser.id : '';
    var chatId = (typeof myObject.browser != 'undefined' && typeof myObject.browser.chat != 'undefined') ? myObject.browser.chat.id : '';
    var group = DataEngine.groups.getGroup(myObject.groupId);
    var internalChatsAreDisabled = true;
    for (var i=0; i<this.myGroups.length; i++) {
        var myGr = DataEngine.groups.getGroup(this.myGroups[i]);
        if (myGr == null || myGr.internal == '1')
            internalChatsAreDisabled = false;
    }

    var groupIsDynamic = (group != null && typeof group.i != 'undefined');
    disabledClass = (myObject.type == 'operator' && (myObject['chat-partner'].userid == thisClass.myLoginId || myObject['chat-partner'].isbot) || internalChatsAreDisabled) ? ' class="ui-disabled"' : '';

    onclickAction = 'OpenChatTab(\'' + myObject['chat-partner'].id + '\');';
    contextMenuHtml += '<div' + disabledClass + ' onclick="' + onclickAction + 'removeOperatorListContextMenu();"><span id="chat-with-this-partner" class="cm-line cm-click">' +
        t('Start Chat') + '</span></div><hr />';

    disabledClass = (myObject.type != 'operator' || myObject['chat-partner'].userid == thisClass.myLoginId || isBot || myObject['chat-partner'].status == 2) ?
        ' class="ui-disabled"' : '';
    onclickAction = 'signOffOperator(\'' + myObject['chat-partner'].id + '\');';
    contextMenuHtml += '<div' + disabledClass + ' onclick="' + onclickAction + 'removeOperatorListContextMenu();"><span id="sign-off-this-operator" class="cm-line cm-click">' + t('Sign off...') + '</span></div><hr />';

    disabledClass = (myObject['chat-partner'].id != thisClass.myId) ? ' class="ui-disabled"' : '';
    onclickAction = 'toggleIndividualGroupStatus(\'' + myObject.groupId + '\', \'remove\');';
    checkVisibility = (myObject.type == 'operator' && $.inArray(myObject.groupId, myObject['chat-partner'].groupsAway) == -1) ? 'visible' : 'hidden';
    contextMenuHtml += '<div' + disabledClass + '>' +
        '<span id="change-operator-group-status" class="cm-line cm-click" onclick="' + onclickAction + '">' +
        t('Status: Default') + ' <span style="visibility: ' + checkVisibility + '">&#10003;</span></span></div>';
    onclickAction = 'toggleIndividualGroupStatus(\'' + myObject.groupId + '\', \'add\');';
    checkVisibility = (myObject.type == 'operator' && $.inArray(myObject.groupId, myObject['chat-partner'].groupsAway) != -1) ? 'visible' : 'hidden';
    contextMenuHtml += '<div' + disabledClass + '><span id="change-operator-group-status" class="cm-line cm-click" onclick="' + onclickAction + '">' + t('Status: Away') + ' <span style="visibility: ' + checkVisibility + '">&#10003;</span></span></div><hr />';

    disabledClass = (myObject.type != 'operator' || internalChatsAreDisabled || isBot) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + '><span id="add-to-dynamic-group" class="cm-line cm-click" onclick="addToChatGroup(\'' + myObject['chat-partner'].id + '\', \'' + browserId + '\', \'' + chatId + '\'); removeOperatorListContextMenu();">' + tid('group_chat_add') + '</span></div>';

    disabledClass = ((myObject.type != 'operator' && myObject.type != 'visitor') || !groupIsDynamic || internalChatsAreDisabled) ? ' class="ui-disabled"' : '';
    var cpId = (myObject.type != 'visitor') ? myObject['chat-partner'].id : myObject['chat-partner'].id + '~' + myObject['chat-partner'].b_id;

    contextMenuHtml += '<div' + disabledClass + ' onclick="removeFromChatGroup(\'' + cpId +'\', \'' + myObject.groupId + '\'); removeOperatorListContextMenu();">' +
        '<span id="remove-from-dynamic-group" class="cm-line cm-click">' + tid('group_chat_remove') + '</span></div><hr>';

    disabledClass = (myObject.type != 'group' || typeof myObject['chat-partner'].i == 'undefined' || internalChatsAreDisabled) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="getDynamicGroupURL(\'' + myObject['chat-partner'].id + '\'); removeOperatorListContextMenu();"><span id="delete-dynamic-group" class="cm-line cm-click">' + tid('get_group_url') + '</span></div>';

    return contextMenuHtml;
};

CommonUIClass.prototype.CreatePostHTML = function(_cpc,_showAvatar){

    var messageText='',addClass = '',avparams,aspace = '',avatar='',name;
    var post = _cpc.postObj;
    var xoperator = DataEngine.operators.getOperator(post.sen);
    var postText = (xoperator==null || typeof post.textOriginal == 'undefined') ? post.text : post.textOriginal;

    postText = (typeof postText != 'undefined') ? lzm_commonTools.replaceLinksInChatView(postText) : '';

    var messageTime = post.time_human;
    var chatText = '<span>' + lzm_displayHelper.replaceSmileys(postText) + '</span>';

    if (typeof post.tr != 'undefined' && post.tr != '')
        chatText = '<span>' + lzm_displayHelper.replaceSmileys(post.tr) + '</span><br /><span class="lz_message_translation">' + lzm_displayHelper.replaceSmileys(postText) + '</span>';
    else if(this.translatedPosts.length)
    {
        var tr = lzm_commonTools.GetElementByProperty(this.translatedPosts,'id',post.id);
        if(tr.length)
        {
            if (d(post.info_header))
                post.info_header.question = tr[0].text;
            else
                chatText = '<span>' + lzm_displayHelper.replaceSmileys(tr[0].text) + '</span>';
        }
    }

    if (d(post.info_header))
    {
        var myMailAddress = (post.info_header.mail != '') ? this.lzm_commonTools.htmlEntities(post.info_header.mail) : '';
        var targetGroup = DataEngine.groups.getGroup(post.info_header.group);
        var phoneNumber = (post.info_header.phone != '') ? '<span style="color: #5197ff; cursor: pointer; text-decoration: underline;" onclick="showPhoneCallDialog(\'' + ChatManager.ActiveChat + '\', -1, \'chat\');">' + this.lzm_commonTools.htmlEntities(post.info_header.phone) + '</span>' : '';

        var groupName = (targetGroup != null) ? targetGroup.name : post.info_header.group;
        var visitorInfoVisible = lzm_commonStorage.loadValue('show_chat_visitor_info_' + DataEngine.myId,1)!=0 && $('#chat-container').width() > CommonUIClass.MinWidthChatVisitorInfo;
        var addRow = '<tr><td class="TCBHF"><!--label--></td><td class="last"><!--value--></td></tr>';

        if(_showAvatar)
        {
            name = (_cpc.chatObj.Visitor != null) ? _cpc.chatObj.GetName() : post.info_header.name;
            avparams = 'name=' + lz_global_base64_url_encode(name);
            avatar = '<div class="avatar-box" style="background-image: url(\'./../picture.php?'+avparams+'\');"></div>';
            avatar = '<td class="TCBA" rowspan="100">' + avatar + '</td>';
        }

        messageText = '<div class="TCBB"><table class="TCB header_class_placeholder"><tr><td class="TCBG" rowspan="100"></td><td class="TCBHF"><!--group_label-->&nbsp;&nbsp;</td><td class="last" style="white-space: normal;"><b><!--group_name--></b><!--receivers--></td>'+avatar+'</tr>';
        messageText = messageText.replace(/<!--group_label-->/g,tidc('group'));
        messageText = messageText.replace(/<!--group_name-->/g,groupName);
        messageText = messageText.replace(/<!--receivers-->/g,(post.info_header.operators.length > 0) ? ' (' + post.info_header.operators + ')' : '');

        if(lz_global_trim(post.info_header.area_code).length > 0)
            messageText += addRow.replace('<!--label-->',tidc('website_name')).replace('<!--value-->',this.lzm_commonTools.htmlEntities(post.info_header.area_code));
        else
            messageText += addRow.replace('<!--label-->',tidc('website_name')).replace('<!--value-->','-');


        messageText += addRow.replace('<!--label-->',tidc('chat_id')).replace('<!--value-->',this.lzm_commonTools.htmlEntities(post.info_header.chat_id));

        if(!visitorInfoVisible && post.info_header.name.length > 0)
            messageText += addRow.replace('<!--label-->',tidc('name')).replace('<!--value-->',this.lzm_commonTools.htmlEntities(post.info_header.name));

        if(!visitorInfoVisible && myMailAddress.length > 0)
            messageText += addRow.replace('<!--label-->',tidc('email')).replace('<!--value-->',myMailAddress).replace(/lz_chat_mail/, 'lz_chat_mail_no_icon');

        if(!visitorInfoVisible && post.info_header.company.length > 0)
            messageText += addRow.replace('<!--label-->',tidc('company')).replace('<!--value-->',this.lzm_commonTools.htmlEntities(post.info_header.company));

        if(_cpc.chatObj.cmb == '1' && phoneNumber.length > 0)
            messageText += addRow.replace('TCBHF','TCBHF TCBHFI').replace('<!--label-->',tid('phone')).replace('<!--value-->',phoneNumber + ' ('+tid('callback')+')');
        else if(!visitorInfoVisible && phoneNumber.length > 0)
            messageText += addRow.replace('<!--label-->',tidc('phone')).replace('<!--value-->',phoneNumber);

        messageText += post.info_header.cf;


        if(post.info_header.url.length > 0)
            messageText += '<tr><td class="TCBHF">'+tidc('url')+'</td><td><a class="lz_chat_link_no_icon" href="#" data-url="'+post.info_header.url+'" onclick="openLink(\''+post.info_header.url+'\');">'+post.info_header.url+'</a></td></tr>';
        messageText += '</table></div>';

        _cpc.previousMessageSender = '';
        _cpc.previousMessageRepost = 1;
        _cpc.previousAddMessageStyle = 1;
    }
    else
    {
        var senderName = _cpc.chatObj.GetName();

        if(xoperator != null)
            senderName = xoperator.name;
        else
        {
            var vchatObj = DataEngine.ChatManager.GetChat(post.sen);
            if(vchatObj != null)
                senderName = vchatObj.GetName();
        }

        if (d(post.warn))
            addClass = ' WCMT';
        else if (post.rp == 1)
            addClass = ' RCMT';
        else if (post.sen == DataEngine.myId)
            addClass = ' OCMT';
        else
        {
            if(xoperator != null)
                addClass = ' OOCMT';
        }

        if(!LocalConfiguration.UIShowAvatars)
            addClass += ' NOAV';

        if (_cpc.previousMessageSender != post.sen || _cpc.previousMessageRepost != post.rp || parseInt(post.date) - _cpc.previousMessageTimestamp > 300)
        {
            if (post.rp == 1)
            {
                messageText = this.messageTemplates['repost'].replace(/<!--name-->/g,(senderName));
            }
            else
            {
                if (post.sen == this.myId)
                    messageText = this.messageTemplates['internal'].replace(/<!--name-->/g,(senderName));
                else if (post.sen == '0000000')
                    messageText = this.messageTemplates['system'].replace(/<!--name-->/g,(senderName));
                else
                    messageText = this.messageTemplates['external'].replace(/<!--name-->/g,(senderName));
            }
            _cpc.previousAddMessageStyle = 1;
        }
        else
        {
            if (post.sen == '0000000')
                messageText = this.messageTemplates['systemadd'].replace(/<!--name-->/g,lzm_commonTools.escapeHtml(senderName, true));
            else if (_cpc.previousAddMessageStyle == 0)
                messageText = this.messageTemplates['add'].replace(/<!--name-->/g,lzm_commonTools.escapeHtml(senderName, true));
            else
                messageText = this.messageTemplates['addalt'].replace(/<!--name-->/g,lzm_commonTools.escapeHtml(senderName, true));
            _cpc.previousAddMessageStyle = 1 - _cpc.previousAddMessageStyle;
        }

        if(LocalConfiguration.UIShowAvatars)
        {
            avparams = (xoperator==null) ? 'name=' + lz_global_base64_url_encode(senderName) : 'intid=' + lz_global_base64_url_encode(post.sen);
            aspace = ' style="width:56px;"';
            avatar = '<div style="background-image: url(\'./../picture.php?'+avparams+'\');"></div>';
        }

        messageText = messageText.replace(/<!--avatar-->/g, avatar);
        messageText = messageText.replace(/<!--aspace-->/g, aspace);
        messageText = messageText.replace(/<!--t-->/g, addClass);
        messageText = messageText.replace(/<!--pn-->/g, post.id);
        messageText = messageText.replace(/<!--time-->/g, messageTime);
        messageText = messageText.replace(/<!--message-->/g, chatText);
        messageText = messageText.replace(/<!--dir-->/g, 'ltr');

        _cpc.previousMessageSender = post.sen;
        _cpc.previousMessageRepost = (post.rp == 1) ? 1 : 0;
    }

    _cpc.html = messageText;
    _cpc.previousMessageTimestamp = parseInt(_cpc.postObj.date);
    return _cpc;
};

CommonUIClass.prototype.DrawChat = function() {

    if(ChatManager.ActiveChat=='')
        ChatManager.ActiveChat = 'LIST';

    if(ChatManager.ActiveChat=='LIST')
    {
        showAllchatsList();
        return;
    }
    var key,mtoadd,senderName,myCurrentChat = DataEngine.ChatManager.GetChat(ChatManager.ActiveChat);
    var chatHtmlString = '',messageText = '',addClass = '';
    var messageList = [];

    myCurrentChat.IsUnread = false;
    var allChats = lzm_commonTools.GetElementByProperty(DataEngine.ChatManager.Chats,'SystemId',ChatManager.ActiveChat);

    if(allChats.length>1)
        allChats = lzm_commonTools.SortByProperty(allChats,'i',false);

    for(key in allChats)
    {
        mtoadd = lzm_commonTools.SortByProperty(allChats[key].Messages,'mtime',false);
        for(var m in mtoadd)
            messageList.push(mtoadd[m]);
    }

    var cpc = new ChatPostController();
    for (var i=0; i<messageList.length; i++)
    {
        cpc.chatObj = myCurrentChat;
        cpc.postObj = messageList[i];
        cpc = this.CreatePostHTML(cpc,LocalConfiguration.UIShowAvatars);

        chatHtmlString += cpc.html;
        if (d(messageList[i].info_header))
        {
            if(messageList[i].info_header.chat_id != cpc.chatObj.i)
                chatHtmlString = chatHtmlString.replace(/header_class_placeholder/g,'TCBOLD');
        }
    }

    this.DrawChatElements();
    this.UpdateAutoForwardUI(myCurrentChat,false);

    if(myCurrentChat.IndicateTyping)
    {
        senderName = myCurrentChat.GetName();
        addClass = ' OOCMT';

        if(!LocalConfiguration.UIShowAvatars)
            addClass += ' NOAV';

        messageText = this.messageTemplates['internal'].replace(/<!--name-->/g,(senderName));
        messageText = messageText.replace(/<!--message-->/g, '<div class="lz_point_load"><span></span><span></span><span></span></div>');
        messageText = messageText.replace(/<!--t-->/g, addClass);
        messageText = messageText.replace(/<!--avatar-->/g, myCurrentChat.GetAvatarObject());
        chatHtmlString += messageText;
    }

    if(myCurrentChat.GetStatus() == Chat.Closed || myCurrentChat.HasDeclined(DataEngine.myId))
    {
        chatHtmlString = chatHtmlString.replace(/header_class_placeholder/g,'TCBOLD');
        chatHtmlString = chatHtmlString.replace(/info_class_placeholder/g,'SCMTOLD');
    }
    else
        chatHtmlString = chatHtmlString.replace(/header_class_placeholder/g,'');


    var thisChatProgress = $('#chat-progress');
    chatHtmlString = chatHtmlString.replace(/lz_chat_link/g, 'lz_chat_link_no_icon').replace(/lz_chat_mail/g, 'lz_chat_mail_no_icon').replace(/_no_icon_no_icon/g, '_no_icon');
    thisChatProgress.html(chatHtmlString);
    chatScrollDown(5);

    $('.CMT').contextmenu(function(){
        CommonUIClass.TranslateChatPost = this;
        var cm = {id: 'chat_post_cm',entries: [{label: tid('translate'), onClick : 'CommonUIClass.__ShowChatMsgTranslator();'}]};
        ContextMenuClass.BuildMenu(event,cm);
        return false;
    });

    $('.last.AP').contextmenu(function(){
        showChatQuestionTranslator(this);
        return false;
    });

    $('#chat-action').css('visibility', 'visible');
    $('#chat-buttons').css('visibility', 'visible');

    UIRenderer.resizeChatView();
};

CommonUIClass.prototype.DrawALL = function () {

    if (this.selected_view == 'internal')
        this.createOperatorList();

    if (this.selected_view == 'mychats')
        this.DrawChat();

    if (this.startPageExists)
        this.startpageDisplay.createStartPage(false, [], []);

    this.createGeoTracking();

    if (this.selected_view == 'reports')
        this.reportsDisplay.createReportList();

    this.ChatsUI.UpdateChatList();
};

CommonUIClass.prototype.DrawChatPanel = function () {
    var thisActiveChatPanel = $('#active-chat-panel');
    var onclickAction = '', oncontextmenuAction = '', onclickCommand = '', buttonId = '',displayCpName = "??";
    var activeCounter = 0,isActiveCloseableChat = false;
    var closeButton = '<div id="close-active-chat-<!--id-->" class="close-active-chat" onclick="CloseChatTabById(\'<!--id-->\',event);"><i class="fa fa-remove"></i></div>';
    var activityHtml = '',thisButtonCss = '';
    var buttonCSSClass = (ChatManager.ActiveChat == '' || ChatManager.ActiveChat == 'LIST') ? 'lzm-tabs lzm-tabs-selected' : 'lzm-tabs';
    var ctxtMenu = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="preventDefaultContextMenu(event);"' : '';
    var thisButtonHtml = '<div onclick="showAllchatsList(true);"' + ctxtMenu + ' class="' + buttonCSSClass + ' lzm-unselectable" id="show-allchats-list"><span>' + t('All Chats') + '</span></div>';

    activityHtml += thisButtonHtml;

    var chatList = DataEngine.ChatManager.GetChats();
    for (var key in chatList)
    {
        try
        {
            var chat = chatList[key];

            if(ChatManager.ActiveChat==chat.SystemId && !chat.TabOpen)
                chat.TabOpen = true;
            else if(!chat.TabOpen)
                continue;

            var co_id = chat.SystemId;
            var group = DataEngine.groups.getGroup(co_id);
            var operator = DataEngine.operators.getOperator(co_id);

            if(chat.Type == Chat.Visitor)
            {
                onclickCommand = 'OpenChatTab(\'' + chat.SystemId + '\');';
                onclickAction = ' onclick="' + onclickCommand + '"';
                oncontextmenuAction = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="' + onclickCommand + 'showVisitorChatActionContextMenu(\'' + chat.v + '~' + chat.b + '\', \'panel\', event);"' : '';
                buttonId = ' id="chat-button-' + chat.v + '_' + chat.b + '"';
                displayCpName = chat.GetName();
            }
            else if(chat.Type == Chat.Operator)
            {
                onclickCommand = 'OpenChatTab(\'' + operator.id + '\');';
                onclickAction = ' onclick="' + onclickCommand + '"';
                oncontextmenuAction = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="' + onclickCommand + 'showVisitorChatActionContextMenu(\'' + operator.id + '\', \'panel\', event);"' : '';
                buttonId = ' id="chat-button-' + operator.id + '"';
                displayCpName = operator.name;
            }
            else if(chat.Type == Chat.ChatGroup)
            {
                if(group != null)
                {
                    onclickCommand = 'OpenChatTab(\'' + group.id + '\');';
                    onclickAction = ' onclick="' + onclickCommand + '"';
                    oncontextmenuAction = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="' + onclickCommand + 'showVisitorChatActionContextMenu(\'' + group.id + '\', \'panel\', event);"' : '';
                    buttonId = ' id="chat-button-' + group.id + '"';
                    displayCpName = group.name;
                }
                else if (co_id == 'everyoneintern')
                {
                    onclickCommand = 'OpenChatTab(\'' + 'everyoneintern' + '\');';
                    onclickAction = ' onclick="' + onclickCommand + '"';
                    oncontextmenuAction = ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) ? ' oncontextmenu="' + onclickCommand + 'showVisitorChatActionContextMenu(\'everyoneintern\', \'panel\', event);"' : '';
                    buttonId = ' id="chat-button-' + 'everyoneintern' + '"';
                    displayCpName = tid('all_operators');
                }
            }

            var iconClass = 'lzm-tab-icon-content';

            if (co_id == 'everyoneintern')
            {
                iconClass='lzm-tab-content';
            }
            else if (group != null)
            {
                iconClass='lzm-tab-content';
            }

            var bgGradientColor = '';
            thisButtonCss = '';

            if (co_id == ChatManager.ActiveChat)
            {
                buttonCSSClass = 'lzm-tabs lzm-tabs-selected';
                bgGradientColor = 'darkViewSelect';
                isActiveCloseableChat = true;
            }
            else
            {
                buttonCSSClass = 'lzm-tabs';
                bgGradientColor = '';
            }

            displayCpName = (displayCpName.length > 18) ? displayCpName.substring(0, 15) + '...' : displayCpName;
            displayCpName = displayCpName.replace(/ /g, '&nbsp;');

            thisButtonHtml = '<div' + onclickAction + oncontextmenuAction + buttonId + ' class="'+buttonCSSClass+' lzm-unselectable">' +
                '<span class="'+iconClass+'" style="background-image: url("");">' + displayCpName + '</span>' +
                closeButton.replace(/<!--id-->/g,chat.SystemId) +
                '</div>';


            activeCounter++;
            activityHtml += thisButtonHtml;
        }
        catch(e)
        {
            deblog(e)
        }
    }



    thisActiveChatPanel.html(activityHtml).trigger('create');

    this.UpdateTabsUI();
    //chatScrollDown(6);
};

CommonUIClass.prototype.DrawChatElements = function(){
    this.DrawChatPanel();
    this.DrawChatMembers();
    this.DrawChatInfo();
};

CommonUIClass.prototype.DrawChatInfo = function(){
    var hideInfo = true;
    var addNew = null;
    if(lzm_commonStorage.loadValue('show_chat_visitor_info_' + DataEngine.myId,1)!=0 && ChatManager.ActiveChat != 'LIST' && ChatManager.ActiveChat != '')
    {
        var visitor = VisitorManager.GetVisitor(ChatManager.ActiveChat.split('~')[0]);
        if(visitor != null && visitor.is_active)
        {
            hideInfo = false;
            if($('#visitor-info-e-'+visitor.id+'-placeholder').length>0)
            {
                $('.embedded-visitor-info').css('display','none');
                $('#visitor-info-e-'+visitor.id+'-placeholder').css('display','block');
            }
            else
            {
                addNew = visitor.id;
            }
        }
    }

    $('#chat-info-body').data('hidden', (hideInfo ? '1' : '0'));

    if(!hideInfo)
        $('#chat-info-body').css({display:'block'});

    if(addNew != null)
    {
        $('#chat-info-elements').append('<div id="visitor-info-e-'+visitor.id+'-placeholder" class="embedded-visitor-info" data-visitor-id="'+visitor.id+'"></div>');
        lzm_chatDisplay.VisitorsUI.ShowVisitorInformation(visitor, '', 0, false);
        //CommunicationEngine.initVisitorFetchInfo(visitor.id);
    }

    $('#chat-info-elements .embedded-visitor-info').each(function(){
        var visitor = VisitorManager.GetVisitor($(this).attr('data-visitor-id'));
        if(!(visitor != null && visitor.is_active)){
            try{
            $(this).remove();
            lzm_chatDisplay.ticketControlTickets[$(this).attr('data-visitor-id')] = [];
            lzm_chatDisplay.archiveControlChats[$(this).attr('data-visitor-id')] = [];
            }catch(e){deblog(e);}
        }
    });
    UIRenderer.resizeMychats();
};

CommonUIClass.prototype.DrawInternalChat = function () {

    $('#visitor-info').html('<div id="visitor-info-headline"><h3>' + t('Visitor Information') + '</h3></div><div id="visitor-info-headline2"></div>').trigger('create');

    $('#chat').css('display', 'block');
    $('#errors').css('display', 'none');

    setEditorDisplay('block');

    this.DrawChat();

    $('#chat-progress').css('display', 'block');
    $('#chat-qrd-preview').css('display', 'block');
    $('#chat-action').css('display', 'block');
    $('#active-chat-panel').css('display', 'block');

    var thisChatButtons = $('#chat-buttons');
    var chatButtonsHtml = '<div style="margin: 6px 0;">';
    chatButtonsHtml += lzm_inputControls.createInputControlPanel();
    chatButtonsHtml += lzm_inputControls.createButton('visitor-chat-actions', '', 'showVisitorChatActionContextMenu(\'' + ChatManager.ActiveChat + '\', \'actions\', event);', t('Actions'), '<i class="fa fa-wrench"></i>', 'lr', {'margin-left': '4px'}, '', '','b');
    chatButtonsHtml += '<span style="float:right">'+lzm_inputControls.createButton('send-chat-btn', '', 'chatInputEnterPressed()', t('Send'), '<i class="fa fa-send"></i>', 'lr', {'padding-left': '10px', 'padding-right': '10px', 'margin-right': '4px'}, t('Send'),'','b');
    chatButtonsHtml += '</span></div>';
    thisChatButtons.html(chatButtonsHtml).trigger('create').css('display', 'block');

    /*
     var press = jQuery.Event("keypress");
     press.ctrlKey = false;
     press.which = 40;
     $("whatever").trigger(press);
     */

    $('.lzm-button').mouseenter(function() {
        $(this).css('background-image', $(this).css('background-image').replace(/linear-gradient\(.*\)/,'linear-gradient(#f6f6f6,#e0e0e0)'));
    });
    $('.lzm-button').mouseleave(function() {
        $(this).css('background-image', $(this).css('background-image').replace(/linear-gradient\(.*\)/,'linear-gradient(#ffffff,#f1f1f1)'));
    });
};

CommonUIClass.prototype.DrawActiveVisitorChat = function () {

    var thisUserChat = DataEngine.ChatManager.GetChat();
    var thisChatAction = $('#chat-action');
    var thisChatProgress = $('#chat-progress');
    var thisChatQrdPreview = $('#chat-qrd-preview');
    var thisChatTable = $('#chat-table');
    var thisChatButtons = $('#chat-buttons');

    thisChatTable.css('display', 'block');

    if (thisUserChat.GetStatus() != Chat.Closed)
    {
        thisChatAction.css('display', 'block');
        setEditorDisplay('block');
    }
    else
    {
        thisChatAction.css('display', 'none');
        setEditorDisplay('none');
    }

    thisChatProgress.css('display', 'block');
    thisChatQrdPreview.css('display', 'block');
    $('#active-chat-panel').css({display: 'block'});

    var openChatHtmlString = '';
    var visitorChat = thisUserChat.v + '~' + thisUserChat.b + '~' + thisUserChat.i;
    var member = thisUserChat.GetMember(DataEngine.myId);

    if (thisUserChat != null && member != null)
    {
        openChatHtmlString += '<div style="margin: 6px 0;">';
        var disabledClass = '';

        if (thisUserChat.GetStatus()==Chat.Closed || thisUserChat.HasDeclined(DataEngine.myId))
            disabledClass += 'ui-disabled ';

        var hiddenClass = (member.s != '0') ? 'disabled-chat-button ui-disabled ' : '';

        if (member.s != 2)
            openChatHtmlString += lzm_inputControls.createInputControlPanel('', disabledClass);

        var myButtonCss = {'margin-left': '4px'};

        var visitorLanguage = DataEngine.userLanguage;
        try
        {
            visitorLanguage = ($.inArray(thisUserChat.Visitor.lang, this.translationLangCodes) != -1) ? thisUserChat.Visitor.lang : thisUserChat.Visitor.lang.split('-')[0].split('_')[0];
        }
        catch(e) {}

        if(visitorLanguage.toUpperCase()=='EN' && thisUserChat.Visitor.ctryi2 != '' && thisUserChat.Visitor.ctryi2.toUpperCase() != 'EN')
            visitorLanguage = this.getCountryLanguage(thisUserChat.Visitor.ctryi2);

        var translateButtonCss = lzm_commonTools.clone(myButtonCss);

        openChatHtmlString += lzm_inputControls.createButton('translate-chat', hiddenClass + disabledClass,'showTranslateOptions(\'' + visitorChat + '\', \'' + visitorLanguage + '\');', '', '<i class="fa fa-lg fa-language"></i>', 'lr', translateButtonCss, t('Translate'));
        openChatHtmlString += lzm_inputControls.createButton('visitor-chat-actions', '', 'showVisitorChatActionContextMenu(\'' + thisUserChat.v + '~' + thisUserChat.b + '\', \'actions\', event);', t('Actions'), '<i class="fa fa-wrench"></i>', 'lr', {'margin-left': '4px'},'','','b',1150);
        openChatHtmlString += '<span style="float:right">'+lzm_inputControls.createButton('send-chat-btn', '', 'SendTranslatedChat(grabEditorContents())', t('Send'), '<i class="fa fa-send"></i>', 'lr', {'padding-left': '10px', 'padding-right': '10px','margin-right': '4px'}, t('Send'),'','b',1150)+'</span>';
        openChatHtmlString += '</div>';
    }

    thisChatButtons.html(openChatHtmlString).trigger("create");
    this.updateTranslateButtonUI(visitorChat);
    thisChatButtons.css('display', 'block');

    $('.lzm-button').mouseenter(function() {
        $(this).css('background-image', $(this).css('background-image').replace(/linear-gradient\(.*\)/,'linear-gradient(#f6f6f6,#e0e0e0)'));
    });
    $('.lzm-button').mouseleave(function() {
        $(this).css('background-image', $(this).css('background-image').replace(/linear-gradient\(.*\)/,'linear-gradient(#ffffff,#f1f1f1)'));
    });
};

CommonUIClass.prototype.DrawPassiveVisitorChat = function () {

    clearEditorContents();
    var thisChatAction = $('#chat-action');
    var thisChatProgress = $('#chat-progress');
    var thisChatQrdPreview = $('#chat-qrd-preview');
    var thisChatButtons = $('#chat-buttons');

    thisChatAction.css('display', 'none');
    setEditorDisplay('none');
    thisChatProgress.css('display', 'block');
    thisChatQrdPreview.css('display', 'block');
    $('#active-chat-panel').css({display: 'block'});

    var noOpenChatHtmlString = '';
    var thisUserChat = DataEngine.ChatManager.GetChat();
    var acceptString = t('Start Chat');

    if (thisUserChat.cmb == '1' && DataEngine.inputList.getInputValueFromVisitor(116,thisUserChat.Visitor) != '')
        acceptString = t('Call now');

    if (thisUserChat != null)
    {
        var disabledClass = '';
        if (thisUserChat.AcceptInitiated || thisUserChat.GetStatus()==Chat.Closed || thisUserChat.HasDeclined(DataEngine.myId) || !thisUserChat.IsMember(DataEngine.myId))
            disabledClass = 'ui-disabled ';
        noOpenChatHtmlString += '<div style="margin: 6px 0;">';
        noOpenChatHtmlString += lzm_inputControls.createButton('show-visitor-info', '', 'showVisitorInfo(\'' + thisUserChat.v + '\');', '', '<i class="fa fa-info"></i>', 'lr',
            {'margin-left': '4px'}, t('Show information')) +
            lzm_inputControls.createButton('accept-chat', disabledClass, '', acceptString, '<i class="fa fa-check"></i>', 'force-text',{'margin-left': '2px','font-size':'11px',padding:'2px 6px'}, t('Start Chat'), 20, 'd') +
            lzm_inputControls.createButton('decline-chat', disabledClass, '', '', '<i class="fa fa-remove"></i>', 'lr', {'margin-left': '4px'}, t('Decline')) +
            lzm_inputControls.createButton('forward-chat', disabledClass, '', '', '<i class="fa fa-arrow-circle-right"></i>', 'lr',{'margin-left': '4px'}, t('Forward'));
        noOpenChatHtmlString += '</div>';
        thisChatButtons.html(noOpenChatHtmlString).trigger("create");
        thisChatAction.css('display', 'none');
        thisChatProgress.css('display', 'block');
        thisChatQrdPreview.css('display', 'block');
        thisChatButtons.css('display', 'block');
    }
    else
        thisChatButtons.html(noOpenChatHtmlString).trigger("create");
};

CommonUIClass.prototype.DrawChatMembers = function(){
    try{

        var hideMembers = true;

        if(ChatManager.ActiveChat != 'LIST')
        {
            var chat = DataEngine.ChatManager.GetChat(ChatManager.ActiveChat);

            if(chat==null)
                return;

            var ev_click,ev_cm, dblc, objid = ChatManager.ActiveChat, memberList = [], addedList = [],operators,operator = null;
            var chatIsOnline = true, displayMinimized = false;

            if($('#chat-container').width()<500 && $.inArray(objid+"AUTOMIN",this.minimizedMemberLists)==-1){
                this.minimizedMemberLists.push(objid+"AUTOMIN");
                this.minimizedMemberLists.push(objid);
            }

            if($.inArray(objid,this.minimizedMemberLists)>-1)
                displayMinimized = true;

            this.memberListWidth = (displayMinimized) ? 0 : 190;

            try
            {
                if($('#chat-container').width()>260)
                {
                    if(chat.Type==Chat.Visitor && ChatManager.ActiveChat == chat.SystemId)
                    {
                        memberList = lzm_commonTools.clone(chat.Members);
                        memberList.push({id:chat.SystemId});
                    }
                    else if(chat.Type == Chat.ChatGroup)
                    {
                        var group = DataEngine.groups.getGroup(chat.SystemId);
                        if(group != null)
                        {
                            if(!d(group.members))
                            {
                                // standard group
                                operators = DataEngine.operators.getOperatorList();
                                for (i=0; i<operators.length; i++)
                                {
                                    if ($.inArray(ChatManager.ActiveChat, operators[i].groups) != -1)
                                    {
                                        if(!operators[i].isbot)
                                        {
                                            memberList.push({id:operators[i].id});
                                            chatIsOnline = true;
                                        }
                                    }
                                }
                            }
                            else
                            {
                                for(var key in group.members)
                                {
                                    addedList.push(group.members[key].id);
                                    memberList.push(group.members[key]);
                                }
                            }
                        }
                        else if(chat.SystemId=='everyoneintern')
                        {
                            operators = DataEngine.operators.getOperatorList();
                            for (i=0; i<operators.length; i++)
                            {
                                if(!operators[i].isbot)
                                {
                                    memberList.push({id:operators[i].id});
                                    chatIsOnline = true;
                                }
                            }
                        }
                    }
                    else if(chat.Type == Chat.Operator)
                    {
                        memberList.push({id:chat.SystemId});
                        memberList.push({id:DataEngine.myId});
                    }
                }
            }
            catch(e){deblog(e);}


            if(memberList.length > 0 && chatIsOnline)
            {
                hideMembers = false;
                $('#chat-members').css('display','block');
                $('#chat-progress, #chat-action, #chat-buttons').css({left: this.memberListWidth + 'px'});
                $('#chat-qrd-preview').css({left: this.memberListWidth + 'px'});
                var membersHtml = '', operatorsHTML = '';
                var nameWidth = ' style="width:' + (this.memberListWidth) + 'px;"';
                var addedMembers = [];

                for(var i = 0;i<memberList.length;i++)
                {
                    var membId = (typeof memberList[i].i != 'undefined') ? memberList[i].i : memberList[i].id;
                    var hasDeclined = (typeof memberList[i].d != 'undefined' && memberList[i].d=='1');

                    if($.inArray(membId,addedMembers)===-1)
                    {
                        addedMembers.push(membId);
                        operator = DataEngine.operators.getOperator(membId);
                        var chatObj = DataEngine.ChatManager.GetChat(membId);

                        if(operator != null)
                        {
                            var icon = (hasDeclined) ? '<i class="fa fa-times icon-member-status icon-orange"></i>' : '<span class="operator-list-icon" style="background-image: url(\'' + this.lzm_commonConfig.lz_user_states[operator.status].icon + '\');"></span>';
                            operatorsHTML += '<div '+nameWidth+' id="'+(chat.SystemId+'-'+i)+'" class="lzm-unselectable chat-member-div '+chat.SystemId+'">'+icon+operator.name+'</div>';
                        }
                        else if(chatObj != null)
                        {
                            membersHtml += '<div '+nameWidth+' id="'+(chat.SystemId+'-'+i)+'" class="lzm-unselectable chat-member-div '+chat.SystemId+'"><span class="user-list-icon"><i class="fa fa-user icon-light"></i></span>'+chatObj.GetName()+'</div>';
                        }
                    }
                }

                if(operatorsHTML != '')
                    operatorsHTML = '<div class="chat-member-div chat-member-split-div"><b>'+t('Operators')+'</b></div>' + operatorsHTML;

                if(membersHtml != '')
                    membersHtml = '<div class="chat-member-div chat-member-split-div"><b>'+t('Visitors')+'</b></div>' + membersHtml;

                $('#chat-members-list').html(operatorsHTML + membersHtml);
                $('#chat-members-list').css({display:(displayMinimized) ? 'none' : 'block'});
                $('#chat-members').css({height:(displayMinimized) ? '81px': '', top: (displayMinimized) ? '' : '0', width: (displayMinimized) ? '19px' : this.memberListWidth + 'px'});
                $('#chat-members-minimize').css({display:'block'});
                $('#chat-buttons').css({'padding-left': (displayMinimized) ? '20px' : 0});
                UIRenderer.resizeChatView();
            }
            else
                hideMembers = true;
        }

        if(hideMembers)
        {
            $('#chat-members-minimize, #chat-members').css({display:'none'});
            $('#chat-progress, #chat-action, #chat-buttons').css({left: 0});
            $('#chat-buttons').css({'padding-left': 0});
        }
        $('#chat-members-minimize i').attr('class',(displayMinimized) ? 'fa fa-chevron-right' : 'fa fa-chevron-left');

    }
    catch(e){deblog(e);}
};

CommonUIClass.prototype.IsFullscreenMode = function(){
    return this.windowHeight > 450 && this.windowWidth > 575 && ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp());
};

CommonUIClass.prototype.ProcessChatUpdates = function(_oldChatObj,_newChatObj,_updateUI){

    var poll=false;
    _updateUI = (d(_updateUI)) ? _updateUI : false;

    if(_oldChatObj==null)
    {
        _updateUI = 1;
        if(_newChatObj.GetStatus() != Chat.Closed)
        {
            ChatManager.DLChatMessagesList.push(_newChatObj.i);
            poll = true;
        }
    }
    else
    {
        if(_updateUI && _oldChatObj.Messages.length == _newChatObj.Messages.length)
            _updateUI = false;

        if(_newChatObj.IsAccepted() && !_oldChatObj.IsAccepted())
        {
            _updateUI = 2;
            addAcceptedMessageToChat(_newChatObj);

            if(_newChatObj.GetMember(DataEngine.myId) != null && _newChatObj.AutoAcceptMessage != null)
                setTimeout(function() {SendTranslatedChat(_newChatObj.AutoAcceptMessage,_newChatObj.SystemId);}, 500);
        }

        if(_newChatObj.GetStatus() != _oldChatObj.GetStatus())
        {
            _updateUI = 3;
            if(_newChatObj.GetStatus()==Chat.Closed && _oldChatObj.GetStatus() != Chat.Closed)
            {
                if(_newChatObj.ClosedBy()==Chat.Operator)
                    addOperatorLeftMessageToChat(_newChatObj,[_newChatObj.GetMember(DataEngine.myId)]);
                if(_newChatObj.ClosedBy()==Chat.Visitor)
                    addLeftMessageToChat(_newChatObj,_newChatObj.GetName(),"");
            }

            if(!_oldChatObj.HasDeclined(DataEngine.myId) && _newChatObj.HasDeclined(DataEngine.myId))
            {
                addOperatorLeftMessageToChat(_newChatObj,[_newChatObj.GetMember(DataEngine.myId)]);
            }
        }

        if(_newChatObj.IsDeclined() && !_oldChatObj.IsDeclined())
        {
            _updateUI = 4;
        }

        // joins
        var m,joins = [];
        for(m in _newChatObj.Members)
        {
            var oldMember = lzm_commonTools.GetElementByProperty(_oldChatObj.Members,'i',_newChatObj.Members[m].i);
            if(!oldMember.length)
            {
                joins.push(_newChatObj.Members[m].i);
                if(_newChatObj.Members[m].i == DataEngine.myId)
                {
                    ChatManager.DLChatMessagesList.push(_newChatObj.i);
                    poll = true;
                }
            }
            else
            {
                if(oldMember[0].d != _newChatObj.Members[m].d)
                    _updateUI = 5;

            }
        }

        var leaves = [];
        for(m in _oldChatObj.Members)
            if(!lzm_commonTools.GetElementByProperty(_newChatObj.Members,'i',_oldChatObj.Members[m].i).length)
                leaves.push(_oldChatObj.Members[m]);

        if(joins.length)
            addOperatorJoinedMessageToChat(_newChatObj,joins);
        if(leaves.length)
            addOperatorLeftMessageToChat(_newChatObj,leaves);

        if(joins.length || leaves.length)
            _updateUI = 6;

        _newChatObj.IndicateTyping = _newChatObj.t=='1' && _newChatObj.GetStatus() != Chat.Closed;

        if(_newChatObj.t != _oldChatObj.t)
            _updateUI = 7;
    }

    if(isAutoAcceptActive() && !_newChatObj.IsAccepted() && _newChatObj.GetMember(DataEngine.myId) != null && _newChatObj.GetMember(DataEngine.myId).s != Chat.StatusFollowerInvisible)
    {
        UserActions.AcceptChat(_newChatObj,true);
    }

    if(_newChatObj.IsUnread && _newChatObj.GetMember(DataEngine.myId)==null)
        _newChatObj.IsUnread = false;


    if(_newChatObj.WasInPublicChatGroup && _newChatObj.GetStatus()==Chat.Closed)
    {
        _newChatObj.CloseChatTab();
        _newChatObj.WasInPublicChatGroup = false;
    }
    else if(_updateUI && ChatManager.ActiveChat == _newChatObj.SystemId && this.selected_view == 'mychats')
    {
        OpenChatTab(_newChatObj.SystemId);
    }

    if(poll)
    {
        CommunicationEngine.InstantPoll();
    }
};

CommonUIClass.prototype.showUsersettingsMenu = function () {
    $('#userstatus-menu').css('display', 'none');
    $('#minified-dialogs-menu').css('display', 'none');
    this.showUserstatusHtml = false;
    this.showMinifiedDialogsHtml = false;
    var tableWidth = $('#main-menu-panel-settings').width();
    var thisUsersettingsMenu = $('#usersettings-menu');
    var usersettingsMenuHtml = '<table style="min-width: ' + tableWidth + 'px;" class="lzm-unselectable">';
    usersettingsMenuHtml += '<tr><td class="usersettings-menu-spacer"></td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="manageUsersettings(event);">' + t('Options') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="showFilterList(event);">' + t('Filters') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="changePassword(event);">' + t('Change Password') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="personalChatLink();">' + tid('per_c_link') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td class="usersettings-menu-spacer"></td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="showTranslationEditor(event);">' + t('Translation Editor') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="showUserManagement(event);">' + t('User Management') + '</td></tr>';
    var dc = (DataEngine.m_ServerConfigBlocked) ? ' class="ui-disabled' : '';
    usersettingsMenuHtml += '<tr><td'+dc+' onclick="initServerConfiguration(event);">' + tid('server_conf') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="initLinkGenerator(event);">' + t('Link Generator') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="initEventConfiguration(event);">' + tid('events') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="initFeedbacksConfiguration(event);">' + tid('feedbacks') + '</td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="showLogs();">Logs</td></tr>';
    usersettingsMenuHtml += '<tr><td class="usersettings-menu-spacer"></td></tr>';
    usersettingsMenuHtml += '<tr><td onclick="logout(true, false, event);">' + t('Log out') + '</td></tr>';

    if(IFManager.IsDesktopApp())
    {
        usersettingsMenuHtml += '<tr><td class="usersettings-menu-spacer"></td></tr>';
        usersettingsMenuHtml += '<tr><td onclick="IFManager.ExitApp=true;logout(true,false);">' + tid('close_application') + '</td></tr>';
    }

    usersettingsMenuHtml += '</table>';
    thisUsersettingsMenu.html(usersettingsMenuHtml);
    thisUsersettingsMenu.css({display: 'block'});
};

CommonUIClass.prototype.createCommentHtml = function(type, line, commentText, operatorName, operatorId, time){
    var commentHtml = '';
    var avatar = '<div style="background-image: url(\'./../picture.php?intid='+lz_global_base64_url_encode(operatorId)+'\');"></div>';
    if(type=='ticket')
        commentHtml = '<tr id="comment-line-' + line + '" class="comment-line lzm-unselectable" style="cursor:pointer;" onclick="handleTicketCommentClick(' + line + ', \'' + lz_global_base64_encode(commentText) + '\');"><td style="width:50px;" class="CMTP">' + avatar + '</td><td style="vertical-align: top;"><span class="comment-line-date">' + time + '</span><br><span><b>' + operatorName + '</b></span><div>' + lzm_commonTools.escapeHtml(commentText) +'</div></td></tr>';
    else
        commentHtml = '<tr onclick="handleVisitorCommentClick(' + line + ');" style="cursor: pointer;" id="visitor-comment-line-' + line + '" class="comment-line lzm-unselectable" data-comment-no="' + line + '"><td style="width:50px;" class="CMTP">' + avatar + '</td><td style="vertical-align: top;"><span class="comment-line-date">' + time + '</span><br><span><b>' + operatorName + '</b></span><div>' + lzm_commonTools.escapeHtml(commentText) + '</div></td></tr>';
    return commentHtml;
};

CommonUIClass.prototype.showUserstatusMenu = function (user_status, myName, myUserId) {
    $('#usersettings-menu').css('display', 'none');
    $('#minified-dialogs-menu').css('display', 'none');
    this.showUsersettingsHtml = false;
    this.showMinifiedDialogsHtml = false;

    var tableWidth = $('#main-menu-panel-settings').width();
    var thisUserstatusMenu = $('#userstatus-menu');
    var userstatusMenuHtml = '<table style="min-width: ' + tableWidth + 'px;">';
    for (var statusIndex = 0; statusIndex < this.lzm_commonConfig.lz_user_states.length; statusIndex++) {
        if (this.lzm_commonConfig.lz_user_states[statusIndex].index != 2) {
            userstatusMenuHtml += '<tr><td class="lzm-unselectable" ' +
                'onclick="setUserStatus(' + this.lzm_commonConfig.lz_user_states[statusIndex].index + ', event)">' +
                '&nbsp;<img src="' + this.lzm_commonConfig.lz_user_states[statusIndex].icon + '" width="14px" ' +
                'height="14px">&nbsp;&nbsp;&nbsp;' + t(this.lzm_commonConfig.lz_user_states[statusIndex].text) + '</td></tr>'
        }
    }
    userstatusMenuHtml += '</table>';
    thisUserstatusMenu.html(userstatusMenuHtml);
    thisUserstatusMenu.css({display: 'block'});
};

CommonUIClass.prototype.setUserStatus = function (statusValue) {
    $('#userstatus-menu').css('display', 'none');
    this.showUserstatusHtml = false;
    ChatPollServerClass.__UserStatus = statusValue;
    var statusIcon = lzm_commonConfig.lz_user_states[2].icon;
    for (var i=0; i<lzm_commonConfig.lz_user_states.length; i++)
        if (lzm_commonConfig.lz_user_states[i].index == ChatPollServerClass.__UserStatus)
            statusIcon = lzm_commonConfig.lz_user_states[i].icon;
    $('#main-menu-panel-status-icon').css({'background-image': 'url(\'' + statusIcon + '\')'});
};

CommonUIClass.prototype.updateTranslateButtonUI = function(visitorChat){
    var highlight = false;
    if (d(lzm_chatDisplay.chatTranslations[visitorChat]))
        highlight = ((lzm_chatDisplay.chatTranslations[visitorChat].tvm != null && lzm_chatDisplay.chatTranslations[visitorChat].tvm.translate)
            || (lzm_chatDisplay.chatTranslations[visitorChat].tmm != null && lzm_chatDisplay.chatTranslations[visitorChat].tmm.translate));

    if(highlight && visitorChat.indexOf(ChatManager.ActiveChat) === 0)
        $('#translate-chat').addClass('lzm-button-b-active');
    else
        $('#translate-chat').removeClass('lzm-button-b-active');
};

CommonUIClass.prototype.createChatMemberActionMenu = function(object) {
    var contextMenuHtml = '', disabledClass = '';

    if(object.browserId.length==0)
    {
        contextMenuHtml += '<div onclick="chatInternalWith(\''+object.userId+'\',\'\',\'\');removeChatMembersListContextMenu();"><span id="chat-show-info" class="cm-line cm-click">' + tid('start_chat') + '</span></div>';
    }
    else
    {
        var activeUserChat = DataEngine.ChatManager.GetChat(object.userId + '~' + object.browserId);
        var gc = activeUserChat.GetChatGroup();
        var cRemove = 'removeFromChatGroup(\''+activeUserChat.SystemId+'\', \''+gc.id+'\');';
        var cTake = 'takeChat(\''+activeUserChat.v+'\',\''+activeUserChat.b+'\',\''+activeUserChat.i+'\', \''+activeUserChat.dcg+'\');';

        disabledClass = (gc==null || ChatPollServerClass.__UserStatus == 3) ? ' class="ui-disabled"' : '';
        contextMenuHtml += '<div' + disabledClass + ' onclick="'+cRemove+cTake+';removeChatMembersListContextMenu();"><span id="chat-show-info" class="cm-line cm-click">' + tid('take') + '</span></div>';

        disabledClass = (activeUserChat.GetStatus() != Chat.Closed) ? ' class="ui-disabled"' : '';
        contextMenuHtml += '<div' + disabledClass + ' onclick="closeChat(\''+activeUserChat.i+'\',\''+activeUserChat.v+'\',\''+activeUserChat.b+'\',true);removeChatMembersListContextMenu();"><span id="chat-show-info" class="cm-line cm-click">' + tid('close') + '</span></div>';

        disabledClass = (activeUserChat.GetStatus() == Chat.Waiting) ? ' class="ui-disabled"' : '';
        contextMenuHtml += '<div' + disabledClass + ' onclick="declineChat(\''+activeUserChat.v+'\', \''+activeUserChat.b+'\', \''+activeUserChat.i+'\');removeChatMembersListContextMenu();"><span id="chat-show-info" class="cm-line cm-click">' + tid('decline') + '</span></div>';

        contextMenuHtml += '<div onclick="showFilterCreation(\'visitor\',\''+activeUserChat.v+'\');removeChatMembersListContextMenu();"><span id="chat-show-info" class="cm-line cm-click">' + tid('ban_add_filter') + '</span></div>';
    }
    return contextMenuHtml;
}

CommonUIClass.prototype.createChatActionMenu = function(myObject) {
    var disabledClass, contextMenuHtml = '';

    disabledClass = (myObject.Type != Chat.Visitor) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showVisitorInfo(\'' + myObject.v + '\');removeVisitorChatActionContextMenu();"><span id="chat-show-info" class="cm-line cm-click">' + t('Details') + '</span></div><hr />';

    contextMenuHtml += '<div onclick="addQrdToChat(3);removeVisitorChatActionContextMenu();"><span id="chat-send-file" class="cm-line cm-click">' + t('Send File') + '</span></div>';

    if ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        contextMenuHtml += '<div onclick="addLinkToChat();"><span id="chat-send-link" class="cm-line cm-click">' + t('Send Url') + '</span></div>';

    disabledClass = (!(myObject.Type == Chat.Visitor && myObject.Visitor != null && DataEngine.inputList.getInputValueFromVisitor(116,myObject.Visitor) != '')) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showPhoneCallDialog(\'' + myObject.v + '~' + myObject.b + '\', -1, \'chat\');removeVisitorChatActionContextMenu();"><span id="chat-start-phone-call" class="cm-line cm-click">' + t('Phone Call') + '</span></div><hr />';

    var memberStatus = myObject.GetMemberStatus(DataEngine.myId);
    disabledClass = (myObject.Type != Chat.Visitor || memberStatus == Chat.StatusFollowerInvisible) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="forwardChat(\'' + myObject.i + '\', \'forward\');removeVisitorChatActionContextMenu();"><span id="chat-forward-chat" class="cm-line cm-click">' + t('Forward Chat') + '</span></div>';

    disabledClass = (myObject.Type != Chat.Visitor) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="forwardChat(\'' + myObject.i + '\', \'invite\');removeVisitorChatActionContextMenu();"><span id="chat-invite-operator" class="cm-line cm-click">' + t('Invite Operator') + '</span></div>';

    disabledClass = (myObject.Type == Chat.ChatGroup) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="addToChatGroup(\'' + myObject.v + '\', \'' + myObject.b + '\', \'' + myObject.i + '\');removeVisitorChatActionContextMenu();"><span class="cm-line cm-click">' + tid('group_chat_add') + '</span></div><hr />';

    disabledClass = (myObject.Type != Chat.Visitor) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showFilterCreation(\'visitor\',\'' + myObject.v + '\');removeVisitorChatActionContextMenu();"><span id="chat-add-filter" class="cm-line cm-click">' + t('Ban (add filter)') + '</span></div><hr />';

    disabledClass = (myObject.Type != Chat.Visitor) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="leaveChat();removeVisitorChatActionContextMenu();"><span id="chat-leave-chat" class="cm-line cm-click">' + t('Leave Chat') + '</span></div>';

    disabledClass = (!DataEngine.groups.isChatGroup(myObject.SystemId)) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="leaveChat();removeFromChatGroup(\''+DataEngine.myId+'\', \''+myObject.SystemId+'\');removeVisitorChatActionContextMenu();"><span id="chat-leave-chat" class="cm-line cm-click">' + tid('leave_group') + '</span></div><hr />';

    disabledClass = (myObject.Type != Chat.Visitor) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showTicketDetails(\'\', false, \'\', \''+myObject.i+'\');removeVisitorChatActionContextMenu();"><span id="chat-add-filter" class="cm-line cm-click">' + tid('create_ticket') + '</span></div><hr />';

    contextMenuHtml += '<div onclick="closeAllInactiveChats();removeVisitorChatActionContextMenu();"><span id="chat-close-all-offline" class="cm-line cm-click">' + t('Close all offline chats') + '</span></div>';

    return contextMenuHtml;
};

CommonUIClass.prototype.catchEnterButtonPressed = function (e) {
    var that = this, thisChatInput = $('#chat-input');
    if (e.which == 13 || e.keyCode == 13)
    {
        try {
            var useResource = '';
            for (var i=0; i<shortCutResources.length; i++) {
                if (shortCutResources[i].complete) {
                    useResource = shortCutResources[i].id;
                    break;
                }
            }
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
            else if (thisChatInput.val().indexOf('/') == 0)
            {

            }
            else
            {
                SendTranslatedChat(grabEditorContents());
            }
        } catch(ex) {}
        e.preventDefault();
    }
    if (e.which == 10 || e.keyCode == 10) {
        var tmp = thisChatInput.val();
        thisChatInput.val(tmp + '\n');
    }
};

CommonUIClass.prototype.searchButtonChange = function(type) {
    $('#search-'+type).css('background',($('#search-'+type).val().length) ? '#ffffe1' : '#fff');
};

CommonUIClass.prototype.searchButtonUp = function(type, myObjects, event, inDialog) {

    if(d(event))
        event.stopPropagation();
    var thisClass = this,  searchString = '';
    var sid = (inDialog) ? 'd-' : '';
    inDialog = (typeof inDialog != 'undefined') ? inDialog : false;

    if (d(event) && (event.which == 13 || event.keycode == 13 || event.charCode == 13))
    {
        thisClass.searchButtonUpSet[type] = 0;
        switch (type)
        {
            case 'qrd':
                thisClass.resourcesDisplay.highlightSearchResults(myObjects,true);
                break;
            case 'ticket':
                searchString = $('#search-ticket').val();
                searchTickets(searchString);
                break;
            case 'archive':
                searchString = $('#search-archive').val();
                console.log(searchString);
                if (searchString != '')
                {
                    $('#clear-archive-search').css({display: 'inline'});
                    thisClass.archiveDisplay.styleArchiveClearBtn();
                    $('#archive-filter').addClass('ui-disabled');
                }
                else
                {
                    $('#clear-archive-search').css({display: 'none'});
                    $('#archive-filter').removeClass('ui-disabled');
                }
                searchArchive(searchString);
                break;
            case 'qrd-list':
                searchString = $('#'+sid+'search-resource').val();
                thisClass.resourcesDisplay.fillQrdSearchList(thisClass.resourcesDisplay.qrdChatPartner, inDialog);
                break;
        }
    }
    else
    {
        thisClass.searchButtonUpSet[type] = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
        setTimeout(function() {
            if (thisClass.searchButtonUpSet[type] != 0 && lzm_chatTimeStamp.getServerTimeString(null, false, 1) - thisClass.searchButtonUpSet[type] >= 990) {
                switch (type) {
                    case 'qrd':
                        thisClass.resourcesDisplay.highlightSearchResults(myObjects,true);
                        break;
                    case 'ticket':
                        searchString = $('#search-ticket').val();
                        if (searchString != '') {
                            $('#clear-ticket-search').css({display: 'inline'});
                            thisClass.styleTicketClearBtn();
                        } else {
                            $('#clear-ticket-search').css({display: 'none'});
                        }
                        searchTickets(searchString);
                        break;
                    case 'archive':
                        searchString = $('#search-archive').val();
                        if (searchString != '') {
                            $('#clear-archive-search').css({display: 'inline'});
                            thisClass.archiveDisplay.styleArchiveClearBtn();
                        } else {
                            $('#clear-archive-search').css({display: 'none'});
                        }
                        searchArchive(searchString);
                        break;
                    case 'qrd-list':
                        searchString = $('#search-resource').val();
                        thisClass.resourcesDisplay.fillQrdSearchList(thisClass.resourcesDisplay.qrdChatPartner, inDialog);
                        break;
                }
            }
        }, 1400);
    }
};

CommonUIClass.prototype.showSubMenu = function(place, category, objectId, contextX, contextY, menuWidth, menuHeight) {
    var i = 0, inDialog;
    var contextMenuHtml = '<div class="cm lzm-unselectable" id="' + place + '-context" onclick="handleContextMenuClick(event);">';
    contextMenuHtml += '<div onclick="showSuperMenu(\'' + place + '\', \'' + category + '\', \'' + objectId + '\', ' + contextX + ', ' + contextY + ', ' + menuWidth + ', ' + menuHeight + ')"><i class="fa fa-caret-left lzm-ctxt-left-fa"></i><span id="show-super-menu" class="cm-line cm-line-icon-left cm-click">' + t('Back') + '</span></div><hr />';
    switch(place)
    {
        case 'qrd-tree':
            if(category=='kb_add')
            {
                inDialog = false;
                contextMenuHtml += '<div onclick="addQrd(1);"><span id="add-qrd-ctxt" class="cm-line">' + tid('text') + '</span></div>';
                contextMenuHtml += '<div onclick="addQrd(2);"><span id="add-qrd-clnk" class="cm-line">' + tid('link') + '</span></div>';
                contextMenuHtml += '<div onclick="addQrd(3);"><span id="add-qrd-cfile" class="cm-line">' + tid('file') + '</span></div>';
                contextMenuHtml += '<div onclick="addQrd(0);"><span id="add-qrd-cfld" class="cm-line">' + tid('resource_folder') + '</span></div>';
            }
            break;
        case 'ticket-list':
        case 'visitor-information':
            var ticket = null, ticketEditor = null, ticketGroup = null;
            for (i=0; i<this.ticketListTickets.length; i++) {
                if(this.ticketListTickets[i].id == objectId) {
                    ticket = this.ticketListTickets[i];
                }
            }
            if (ticket != null) {
                ticketEditor = (typeof ticket.editor != 'undefined' && ticket.editor != false) ? ticket.editor.ed : '';
                ticketGroup = (typeof ticket.editor != 'undefined' && ticket.editor != false && ticket.editor.g != '') ? ticket.editor.g : ticket.gr;
            }
            if(category=='operator')
            {
                var operators = DataEngine.operators.getOperatorList();
                for (i=0; i<operators.length; i++)
                    if (operators[i].isbot != '1' && operators[i].id != ticketEditor) {
                        contextMenuHtml += '<div onclick="setTicketOperator(\'' + objectId + '\', \'' + operators[i].id + '\')"><span id="ticket-set-operator-' + operators[i].id + '" class="cm-line cm-click">' + operators[i].name + '</span></div>';
                    }
            }
            else if(category=='group')
            {
                var groups = DataEngine.groups.getGroupList();
                for (i=0; i<groups.length; i++) {
                    if (groups[i].id != ticketGroup) {
                        var groupHash = md5(groups[i].id).substr(0,6);
                        contextMenuHtml += '<div onclick="setTicketGroup(\'' + objectId + '\', \'' + groups[i].id + '\')"><span id="ticket-set-group-' + groupHash + '" class="cm-line cm-click">' + groups[i].name + '</span></div>';
                    }
                }
            }
            else if(category=='ticket_priority')
            {
                inDialog = (place == 'ticket-list') ? false : true;
                contextMenuHtml += '<div onclick="setTicketPriority(\'' + objectId + '\',4)"><span class="cm-line cm-line-icon-left cm-click text-red text-bold">' + tid('priority_4') + '</span></div>';
                contextMenuHtml += '<div onclick="setTicketPriority(\'' + objectId + '\',3)"><span class="cm-line cm-line-icon-left cm-click text-orange text-bold">' + tid('priority_3') + '</span></div>';
                contextMenuHtml += '<div onclick="setTicketPriority(\'' + objectId + '\',2)"><span class="cm-line cm-line-icon-left cm-click">' + tid('priority_2') + '</span></div>';
                contextMenuHtml += '<div onclick="setTicketPriority(\'' + objectId + '\',1)"><span class="cm-line cm-line-icon-left cm-click">' + tid('priority_1') + '</span></div>';
                contextMenuHtml += '<div onclick="setTicketPriority(\'' + objectId + '\',0)"><span class="cm-line cm-line-icon-left cm-click">' + tid('priority_0') + '</span></div>';

            }
            else if(category=='ticket_status')
            {
                inDialog = (place == 'ticket-list') ? false : true;
                contextMenuHtml += '<div onclick="changeTicketStatus(0,null,null,null,false)"><i class="fa fa-question-circle" style="color: #5197ff;"></i><span id="set-ticket-open" class="cm-line cm-line-icon-left cm-click">' + t('Open (O)') + '</span></div>';
                contextMenuHtml += '<div onclick="changeTicketStatus(1,null,null,null,false)"><i class="fa fa-gear" style="color: #808080"></i><span id="set-ticket-progress" class="cm-line cm-line-icon-left cm-click">' + t('In Progress (P)') + '</span></div>';
                contextMenuHtml += '<div onclick="changeTicketStatus(2,null,null,null,false)"><i class="fa fa-check-circle" style="color: #009a00;"></i><span id="set-ticket-closed" class="cm-line cm-line-icon-left cm-click">' + t('Closed (C)') + '</span></div>';
                contextMenuHtml += '<div onclick="changeTicketStatus(3,null,null,null,false)"><i class="fa fa-remove" style="color: #cc0000;"></i><span id="set-ticket-deleted" class="cm-line cm-line-icon-left cm-click">' + t('Deleted (D)') + '</span></div>';
            }
            else if(category=='ticket_sub_status')
            {
                var inDialog = (place == 'ticket-list') ? false : true;
                var myStatus = (ticket.editor) ? ticket.editor.st : 0;
                for(key in DataEngine.global_configuration.database['tsd'])
                {
                    var elem = DataEngine.global_configuration.database['tsd'][key];
                    if(elem.type == 0 && elem.parent == myStatus){
                        contextMenuHtml += '<div onclick="changeTicketStatus(null,\''+elem.name+'\',null,null,false)"><span class="cm-line cm-line-icon-left cm-click">' + elem.name + '</span></div>';
                    }
                }
            }
            else if(category=='ticket_channel')
            {
                var inDialog = (place == 'ticket-list') ? false : true;
                var channels = [t('Web'), t('Email'), t('Phone'), t('Misc'), t('Chat'), tid('feedback')];

                for(key in channels)
                {
                    var elem = channels[key];
                    contextMenuHtml += '<div onclick="changeTicketStatus(null,null,\''+key+'\',null,false)"><span class="cm-line cm-line-icon-left cm-click">' + elem + '</span></div>';
                }
            }
            else if(category=='ticket_sub_channel')
            {
                var inDialog = (place == 'ticket-list') ? false : true;
                var myChannel = ticket.t;
                for(key in DataEngine.global_configuration.database['tsd'])
                {
                    var elem = DataEngine.global_configuration.database['tsd'][key];
                    if(elem.type == 1 && elem.parent == myChannel){
                        contextMenuHtml += '<div onclick="changeTicketStatus(null,null,null,\''+elem.name+'\',false)"><span class="cm-line cm-line-icon-left cm-click">' + elem.name + '</span></div>';
                    }
                }
            }
            else if(category=='add_to_watch_list')
            {
                var operators = DataEngine.operators.getOperatorList('name', '', true);
                for (i=0; i<operators.length; i++)
                    if (operators[i].isbot != 1)
                        contextMenuHtml += '<div onclick="addTicketToWatchList(\'' + objectId + '\',\'' + operators[i].id + '\')"><span id="set-ticket-open" class="cm-line cm-line-icon-left cm-click">' + operators[i].name + '</span></div>';
            }
            break;
    }
    contextMenuHtml += '</div>';

    var myParent = 'body';
    if (place != 'body' && place != 'ticket-details' && place != 'visitor-list-table-div') {
        myParent = '#' + place + '-body';
    } else if (place != 'body') {
        myParent = '#' + place;
    }
    var checkSizeDivHtml = '<div id="context-menu-check-size-div" style="position:absolute; left: -3000px; top: -3000px;' + ' width: 2500px; height: 2500px;"></div>';
    $('body').append(checkSizeDivHtml);
    var testContextMenuHtml = contextMenuHtml.replace(/id="/g, 'id="test-');
    $('#context-menu-check-size-div').html(testContextMenuHtml);
    var contextHeight = $('#test-' + place + '-context').height();
    var contextWidth = (contextHeight > menuHeight) ? menuWidth + lzm_displayHelper.getScrollBarWidth() : menuWidth;
    contextHeight = Math.min(contextHeight, menuHeight);
    var contextTop = (contextHeight >= menuHeight) ? contextY : contextY + Math.round((menuHeight - contextHeight) / 2);

    $('#context-menu-check-size-div').remove();
    this.storedSuperMenu = $('#' + place + '-context').html();
    $('#' + place + '-context').replaceWith(contextMenuHtml);
    var myStyleObject = {left: contextX, width: contextWidth+'px', height: contextHeight+'px', top: contextTop};
    $('#' + place + '-context').css(myStyleObject);
};

CommonUIClass.prototype.showSuperMenu = function(place, category, objectId, contextX, contextY, menuWidth, menuHeight) {
    var contextMenuHtml = '<div class="cm lzm-unselectable" id="' + place + '-context" onclick="handleContextMenuClick(event);">' + this.storedSuperMenu + '</div>';
    $('#' + place + '-context').replaceWith(contextMenuHtml);
    var myStyleObject = {left: contextX+'px', width: menuWidth+'px', height: menuHeight+'px', top: contextY+'px'};
    $('#' + place + '-context').css(myStyleObject);
};

CommonUIClass.prototype.showContextMenu = function(place, myObject, mouseX, mouseY, button) {
    button = (typeof button != 'undefined') ? button : '';
    var thisClass = this;
    var contextX = mouseX + 'px', contextY = mouseY + 'px', contextMenuName = place;
    var widthOffset = 0;
    $('#' + place + '-context').remove();

    var contextMenuHtml = '<div class="cm lzm-unselectable" id="' + contextMenuName + '-context" onclick="handleContextMenuClick(event);">';
    switch(place) {
        case 'qrd-tree':
            contextMenuHtml += thisClass.resourcesDisplay.createQrdTreeContextMenu(myObject);
            break;
        case 'chat-info':
        case 'ticket-list':
        case 'visitor-information':
            widthOffset = 40;
            contextMenuHtml += thisClass.ticketDisplay.createTicketListContextMenu(myObject, place, widthOffset);
            break;
        case 'ticket-details':
            widthOffset = 20;
            contextMenuHtml += thisClass.ticketDisplay.createTicketDetailsContextMenu(myObject);
            break;
        case 'archive-filter':
            contextMenuHtml += thisClass.archiveDisplay.createArchiveFilterMenu(myObject);
            place = 'chat_page';
            break;
        case 'visitor-list-table-div':
            widthOffset = 20;
            contextMenuHtml += thisClass.VisitorsUI.createVisitorListContextMenu(myObject);
            break;
        case 'operator-list':
            widthOffset = 20;
            contextMenuHtml += thisClass.createOperatorListContextMenu(myObject);
            break;
        case 'report-list':
            contextMenuHtml += thisClass.reportsDisplay.createReportListContextMenu(myObject);
            break;
        case 'report-filter':
            contextMenuHtml += thisClass.reportsDisplay.createReportFilterMenu(myObject);
            place = 'chat_page';
            break;
        case 'chat-allchats':
            widthOffset = 20;
            contextMenuHtml += thisClass.ChatsUI.CreateChatContextMenu(myObject);
            break;
        case 'filter-list':
            contextMenuHtml += thisClass.FilterConfiguration.createFilterListContextMenu(myObject);
            break;
        case 'events-list':
            contextMenuHtml += thisClass.EventConfiguration.createEventsListContextMenu(myObject);
            place = 'event-configuration';
            break;
        case 'chat-actions':
            widthOffset = 40;
            contextMenuHtml += thisClass.createChatActionMenu(myObject);
            place = 'chat-container';
            break;
        case 'archive':
            widthOffset = 20;
            contextMenuHtml += thisClass.archiveDisplay.createArchiveContextMenu(myObject);
            break;
        case 'chat-members':
            widthOffset = 20;
            contextMenuHtml += thisClass.createChatMemberActionMenu(myObject);
            break;
    }
    contextMenuHtml += '</div>';

    var myParent = 'body';
    if($('#' + place + '-body').length)
    //if (place != 'body' && place != 'ticket-details' && place != 'visitor-list-table-div' && place != 'chat-members' && place != 'chat_page' && place != 'chat-container')
        myParent = '#' + place + '-body';
    else if (place != 'body')
        myParent = '#' + place;


    if(typeof myObject.parent != 'undefined')
        myParent = '#' + myObject.parent;


    var checkSizeDivHtml = '<div id="context-menu-check-size-div" style="position:absolute; left: -1000px; top: -1000px; width: 800px; height: 800px;"></div>';
    $('body').append(checkSizeDivHtml);
    $('#context-menu-check-size-div').html(contextMenuHtml);

    var parentWidth = $(myParent).width();
    var parentHeight = $(myParent).height();
    var contextWidth = $('#' + contextMenuName + '-context').width();
    var contextHeight = Math.min(parentHeight - 24, $('#' + contextMenuName + '-context').height());

    if (parentHeight != null && parentWidth != null)
    {
        var remainingHeight = parentHeight - mouseY;
        var remainigWidth = parentWidth - mouseX;
        var widthDiff = remainigWidth - contextWidth - 12;
        var heightDiff = remainingHeight - contextHeight - 12;

        if ($.inArray(contextMenuName, ['ticket-filter', 'report-filter', 'archive-filter']) == -1) {
            if (widthDiff < 0) {
                contextX = Math.max((mouseX - contextWidth - 12), 5) + 'px';
            }
            if (heightDiff < 0) {
                contextY = Math.max((mouseY - contextHeight - 12), 5) + 'px';
            }
        } else {
            if (widthDiff < 0) {
                contextX = Math.max((mouseX + widthDiff - 10), 5) + 'px';
            }
            if (heightDiff < 0) {
                contextY = Math.max((mouseY + heightDiff- 10), 5) + 'px';
            }
        }
    }

    $('#context-menu-check-size-div').remove();
    contextMenuHtml = contextMenuHtml.replace(/%CONTEXTX%/g, parseInt(contextX)).replace(/%CONTEXTY%/g, parseInt(contextY)).replace(/%MYWIDTH%/g, parseInt(contextWidth)).replace(/%MYHEIGHT%/g, parseInt(contextHeight));
    $(myParent).append(contextMenuHtml);

    var myStyleObject = {left: contextX, width: (contextWidth+widthOffset)+'px', height: contextHeight+'px'};

    if (button == 'ticket-message-actions')
        myStyleObject.bottom = '0';
    else if (button == 'chat-actions' && myObject.button == 'actions')
        myStyleObject.bottom = '78px';
    else
        myStyleObject.top = contextY;

    $('#' + contextMenuName + '-context').css(myStyleObject);
};

CommonUIClass.prototype.styleTicketClearBtn = function() {
    var ctsBtnWidth = $('#clear-ticket-search').width();
    var ctsBtnHeight =  $('#clear-ticket-search').height();
    var ctsBtnPadding = Math.floor((18-ctsBtnHeight)/2)+'px ' +  Math.floor((18-ctsBtnWidth)/2)+'px ' + Math.ceil((18-ctsBtnHeight)/2)+'px ' +  Math.ceil((18-ctsBtnWidth)/2)+'px';
    $('#clear-ticket-search').css({padding: ctsBtnPadding});
};

CommonUIClass.prototype.styleResourceClearBtn = function() {
    var ctsBtnWidth = $('#clear-resource-search').width();
    var ctsBtnHeight =  $('#clear-resource-search').height();
    var ctsBtnPadding = Math.floor((18-ctsBtnHeight)/2)+'px ' +  Math.floor((18-ctsBtnWidth)/2)+'px ' + Math.ceil((18-ctsBtnHeight)/2)+'px ' +  Math.ceil((18-ctsBtnWidth)/2)+'px';
    $('#clear-resource-search').css({padding: ctsBtnPadding});
};

CommonUIClass.prototype.createMainMenuPanel = function() {
    var panelHtml = lzm_displayHelper.createMainMenuPanel();
    $('#main-menu-panel').html(panelHtml).trigger('create');
    UIRenderer.resizeMenuPanels();
};

CommonUIClass.prototype.createViewSelectPanel = function() {
    var viewSelectPanel = lzm_displayHelper.createViewSelectPanel();
    $('#new-view-select-panel').html(viewSelectPanel);
};

CommonUIClass.prototype.playSound = function(name, sender) {

    if (name == 'message')
        blinkPageTitle(tid('new_chat_activity'));
    else if (name == 'ticket')
        blinkPageTitle(tid('new_ticket_activity'));

    var thisClass = this;

    if ($.inArray(sender, thisClass.soundPlayed) == -1)
    {
        IFManager.IFPlaySound(name, this.volume/100);
    }
    thisClass.addSoundPlayed(sender);
    setTimeout(function() {thisClass.removeSoundPlayed(sender);}, 2000);

};

CommonUIClass.prototype.addSoundPlayed = function(sender) {
    if ($.inArray(sender,this.soundPlayed) == -1) {
        this.soundPlayed.push(sender);
    }
};

CommonUIClass.prototype.removeSoundPlayed = function(sender) {
    if ($.inArray(sender,this.soundPlayed) != -1) {
        var tmpSoundPlayed = [];
        for (var i=0; i<this.soundPlayed.length; i++) {
            if (this.soundPlayed[i] != sender) {
                tmpSoundPlayed.push(this.soundPlayed[i]);
            }
        }
        this.soundPlayed = tmpSoundPlayed;
    }
};

CommonUIClass.prototype.ProcessChatIndication = function(){

    var chatobj,key,chatlist = DataEngine.ChatManager.GetChatsOf(DataEngine.myId,[Chat.Open]);
    var notificationSound = LocalConfiguration.PlayChatSound ? 'NONE' : 'DEFAULT';

    this.SoundIntervalRing = false;
    if(LocalConfiguration.RepeatChatSound)
        this.SoundIntervalRing = chatlist.length>0;
    else if(LocalConfiguration.PlayChatSound)
    {
        for(key in chatlist)
        {
            chatobj = chatlist[key];
            if($.inArray(chatobj.i ,ChatUI.ChatsSoundPlayed) == -1)
            {
                ChatUI.ChatsSoundPlayed.push(chatobj.i);
                this.SoundIntervalRing = true;
                HeartBeatActions(true);
            }
        }
    }

    this.SoundIntervalQueue = false;
    var queuedList = DataEngine.ChatManager.GetQueued();
    if(LocalConfiguration.RepeatQueueSound)
        this.SoundIntervalQueue = queuedList.length>0;
    else if(LocalConfiguration.PlayQueueSound)
    {
        for(key in queuedList)
        {
            chatobj = queuedList[key];
            if($.inArray(chatobj.i ,ChatUI.ChatsQueueSoundPlayed) == -1)
            {
                ChatUI.ChatsQueueSoundPlayed.push(chatobj.i);
                this.SoundIntervalQueue = true;
                HeartBeatActions(true);
            }
        }
    }

    if(this.HeartBeat == null /*&& chatlist.length && DataEngine.ChatManager.IsUnread()*/)
    {
        this.HeartBeat = setInterval(function(){HeartBeatActions(false);},2000);
        HeartBeatActions(true);
    }

    for (var k=0; k<chatlist.length; k++)
    {
        var chatObj = chatlist[k];

        if(chatObj.NotificationsSent)
            continue;

        chatObj.NotificationsSent = true;
        var senderQuestion = '', senderName = chatObj.GetName(56,true);

        if (chatObj.Visitor != null)
            senderQuestion = chatObj.s.length ? chatObj.s : t('New Chat Request');

        var notificationPushText = t('<!--sender--> wants to chat with you.', [['<!--sender-->', lzm_commonTools.htmlEntities(senderName)]]);

        if(LocalConfiguration.NotificationChats || !IFManager.IsDesktopApp())
            IFManager.IFShowNotification(t('LiveZilla'), notificationPushText, notificationSound, chatObj.SystemId, chatObj.SystemId, '0');

        this.lastChatSendingNotification = chatObj.SystemId;

        if(!IFManager.IsDesktopApp())
        {
            if (this.selected_view != 'mychats' || $('.dialog-window-container').length > 0)
            {
                if(senderQuestion != '')
                    notificationPushText = senderQuestion;

                if(LocalConfiguration.NotificationChats)
                    lzm_displayHelper.showBrowserNotification({
                        text: notificationPushText,
                        sender: senderName,
                        subject: t('New Chat Request'),
                        action: 'openChatFromNotification(\'' + chatObj.SystemId + '\'); closeOrMinimizeDialog();',
                        timeout: 10,
                        icon: 'fa-commenting'
                    });
            }
        }
    }
};

CommonUIClass.prototype.UpdateAutoForwardUI = function(chatObj,_fromTimer){

    if(chatObj != null && chatObj.AutoForwardCountdown != null)
    {
        if(chatObj.GetStatus() != Chat.Open || chatObj.GetMember(DataEngine.myId)==null || chatObj.GetChatGroup()!=null)
        {
            clearInterval(chatObj.AutoForwardCountdown);
            chatObj.AutoForwardCountdown = null;
            chatObj.AutoForwardTimeLeft = -1;
            return;
        }

        if(chatObj.AutoForwardTimeLeft == 0)
        {
            CommunicationEngine.pollServerSpecial({v: chatObj.v, b: chatObj.b, c: chatObj.i, g: chatObj.dcg, o: chatObj.AutoForwardTarget,a:true}, 'take-chat');
            clearInterval(chatObj.AutoForwardCountdown);
            chatObj.AutoForwardCountdown = null;
            chatObj.AutoForwardTimeLeft = -1;
        }

        var uiText = tid('start_chat')+' ('+ Math.max(chatObj.AutoForwardTimeLeft,0).toString()+ ')';
        if(lzm_chatDisplay.selected_view == 'mychats' && ChatManager.ActiveChat == chatObj.SystemId)
        {
            $('#accept-chat-text').html(uiText);
        }
        else if(lzm_chatDisplay.selected_view == 'mychats' && ChatManager.ActiveChat == 'LIST')
        {
            $('#ac-accept-chat-'+chatObj.i).html(uiText);
        }

        if(chatObj.AutoForwardTimeLeft<=0)
            $('#accept-chat').addClass('ui-disabled');

        if(_fromTimer && chatObj.AutoForwardTimeLeft!=-1)
            chatObj.AutoForwardTimeLeft--;
    }
};

CommonUIClass.prototype.showDisabledWarning = function() {
    var that = this;
    if (this.serverIsDisabled && (lzm_chatTimeStamp.getServerTimeString(null, false, 1) - this.lastDiabledWarningTime >= 90000)) {
        if (!this.alertDialogIsVisible) {
            this.alertDialogIsVisible = true;
            var confirmText = t('This LiveZilla server has been deactivated by the administrator.') + '<br />' +
                t('Do you want to logout now?');
            lzm_commonDialog.createAlertDialog(confirmText, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
            $('#alert-btn-ok').click(function() {
                that.alertDialogIsVisible = false;
                logout(false);
            });
            $('#alert-btn-cancel').click(function() {
                that.lastDiabledWarningTime = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
                that.alertDialogIsVisible = false;
                lzm_commonDialog.removeAlertDialog();
            });
        }
    }
};

CommonUIClass.prototype.getLanguageDisplayName = function(lang){
    return (typeof this.availableLanguages[lang.toLowerCase()] != 'undefined') ?
        lang + ' - ' + this.availableLanguages[lang.toLowerCase()] :
        (typeof this.availableLanguages[lang.toLowerCase().split('-')[0]] != 'undefined') ?
            lang + ' - ' + this.availableLanguages[lang.toLowerCase().split('-')[0]] :
            lang;
};

CommonUIClass.prototype.openPhoneCallDialog = function(myObject, lineNo, caller) {
    var that = this;
    var pcp = lzm_commonStorage.loadValue('ph_cll_prot_' + DataEngine.myId);
    if(pcp==null)
        pcp='skype:';

    lineNo = (caller == 'ticket') ? (myObject.messages[lineNo].p != '') ? lineNo : 0 : lineNo;
    var dialogId = (caller == 'ticket') ? lzm_chatDisplay.ticketDialogId[myObject.id] : '';
    var windowId = (caller == 'ticket') ? 'ticket-details' : 'phone-call';
    var menuEntry = (caller == 'ticket') ?
        t('Ticket (<!--ticket_id-->, <!--name-->)',[['<!--ticket_id-->', myObject.id],['<!--name-->', myObject.messages[0].fn]]) :
        (caller == 'chat') ? t('Call chat partner <!--chat_partner-->', [['<!--chat_partner-->', myObject[1].cname]]) : t('Phone Call');
    var headerString = t('Start call');
    var footerString =
        lzm_inputControls.createButton('phone-call-now', '','', t('Call now'), '', 'lr',{'margin-left': '6px'},'',30,'d')+
        lzm_inputControls.createButton('phone-call-cancel', '','', t('Cancel'), '', 'lr',{'margin-left': '6px'},'',30,'d');
    var bodyString = '<div id="phone-call-phonenumber-placeholder"></div>';
    var phoneNumber = (caller == 'ticket') ? myObject.messages[lineNo].p : (caller == 'chat') ? myObject[1].cphone : '';
    var phoneProtocols = [{value: 'callto:', text: tid('callto')},
        {value: 'tel:', text: tid('tel')},
        {value: 'skype:', text: tid('skype')}];
    var phoneContent = '<div id="phone-call-phonenumber-inner" class="lzm-fieldset top-space">' +
        lzm_inputControls.createSelect('phonecall-protocol', '', '', tidc('protocol'), {position: 'right', gap: '0px'},{width: '205px'}, '', phoneProtocols, that.lastPhoneProtocol, '') +
        lzm_inputControls.createInput('phone-number', '', phoneNumber, tidc('number'), '<i class="fa fa-phone"></i>', 'text', 'a') +
        '</div>';

    var dialogData = (caller == 'ticket') ? {'ticket-id': myObject.id, menu: menuEntry} : {menu: menuEntry};

    if (caller == 'ticket') {
        lzm_displayHelper.minimizeDialogWindow(dialogId, windowId, {'ticket-id': myObject.id, menu: menuEntry}, 'tickets', false);
        lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, windowId, {}, {}, {}, {}, '', dialogData, true, false, dialogId + '_call');
    } else
        lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, windowId, {}, {}, {}, {}, '', dialogData, true, false);


    lzm_displayHelper.createTabControl('phone-call-phonenumber-placeholder', [{name: t('Start call'), content: phoneContent}]);
    $('#phonecall-protocol-inner-text').html(that.lastPhoneProtocol);

    if (caller == 'ticket')
        UIRenderer.resizeTicketDetails();
    else
        UIRenderer.resizePhoneCall();

    $('#phonecall-protocol').change(function() {
        var selectText = '';
        for (var i=0; i<phoneProtocols.length; i++) {
            if (phoneProtocols[i].value == $('#phonecall-protocol').val()) {
                selectText = phoneProtocols[i].value;
            }
        }
        $('#phonecall-protocol-inner-text').html(selectText);
    });
    $('#phone-call-cancel').click(function() {
        if (caller == 'ticket') {
            lzm_displayHelper.removeDialogWindow('ticket-details');
            lzm_displayHelper.maximizeDialogWindow(dialogId);
        } else {
            lzm_displayHelper.removeDialogWindow('phone-call');
            if (caller == 'chat' && $.inArray(myObject[0].id + '~' + myObject[1].id, UserActions.chatCallBackList) == -1) {
                UserActions.chatCallBackList.push(myObject[0].id + '~' + myObject[1].id);
            }
        }
    });
    $('#phone-call-now').click(function() {
        that.lastPhoneProtocol = $('#phonecall-protocol').val();
        startPhoneCall($('#phonecall-protocol').val(), $('#phone-number').val());
        lzm_commonStorage.saveValue('ph_cll_prot_' + DataEngine.myId,that.lastPhoneProtocol);
        $('#phone-call-cancel').click();
    });
    $('#phone-number').focus();
    $('#phone-number').blur();
};

CommonUIClass.prototype.getCountryName = function(isoCode,addRegion){
    addRegion = d(addRegion) ? addRegion : true;
    var countryName = isoCode;

    var cobj = lzm_commonTools.GetElementByProperty(lzcil,'alpha2Code',isoCode.toUpperCase());
    if(cobj.length)
    {
        cobj = cobj[0];
        if(d(cobj['name']))
            countryName = cobj['name'];
        if(d(cobj['translations']))
        {
            var mylang = DataEngine.operators.getOperator(this.myId).lang.toLowerCase();
            if(d(cobj['translations'][mylang]))
                countryName = cobj['translations'][mylang];
        }
        if(addRegion && d(cobj['subregion']) && UIRenderer.windowWidth > 700)
            countryName += ' (' + cobj['subregion'] + ' / ' + cobj['region'] + ')';
    }
    return countryName;
};

CommonUIClass.prototype.getCountryLanguage = function(isoCode){
    var spLanguage = 'EN';
    var cobj = lzm_commonTools.GetElementByProperty(lzcil,'alpha2Code',isoCode.toUpperCase());
    if(cobj.length)
    {
        cobj = cobj[0];
        if(d(cobj['languages']))
            spLanguage = cobj['languages'][0];
    }
    if(!d(spLanguage))
        return 'EN';
    return spLanguage.toUpperCase();
};

CommonUIClass.prototype.showObjectTranslator = function(type, obj) {
    var that=this,headerString = t('Translate'),msgText,dialogId,dialogData='',dialogName,selectedView;
    var footerString = '<span style="float:right;">' + lzm_inputControls.createButton('translate-obj-replace', '', '', t('Replace'), '', 'lr',{'margin-left': '6px', 'margin-top': '-2px'},'',30,'d');

    if(type!='chat_question')
        footerString += lzm_inputControls.createButton('translate-obj-attach', '', '', t('Attach'), '', 'lr',{'margin-left': '6px', 'margin-top': '-2px'},'',30,'d');

    if(type=='ticket')
        footerString += lzm_inputControls.createButton('translate-obj-comment', '', '', t('Comment'), '', 'lr',{'margin-left': '6px', 'margin-top': '-2px'},'',30,'d');

    footerString += lzm_inputControls.createButton('translate-obj-cancel', '', '', t('Cancel'), '', 'lr',{'margin-left': '6px', 'margin-top': '-2px'},'',30,'d') + '</span>';

    if ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        footerString += '<span style="float:left;">' + lzm_inputControls.createButton('translate-obj-retranslate', '', '', t('Translate'), '', 'lr',{'margin-left': '6px', 'margin-top': '-2px'},'',30,'e') + '</span>';

    dialogName = 'obj-translator';

    if(type=='ticket')
    {
        msgText = obj[0].messages[obj[1]].mt;
        dialogId = (typeof lzm_chatDisplay.ticketDialogId[obj[0].id] != 'undefined') ? lzm_chatDisplay.ticketDialogId[obj[0].id] : md5(Math.random().toString());
        var ticketSender = (obj[0].messages[0].fn.length > 20) ? lzm_commonTools.escapeHtml(obj[0].messages[0].fn).substr(0, 17) + '...' : lzm_commonTools.escapeHtml(obj[0].messages[0].fn);
        var menuEntry = t('Ticket (<!--ticket_id-->, <!--name-->)',[['<!--ticket_id-->', obj[0].id],['<!--name-->', ticketSender]]);
        dialogData = {'ticket-id': obj[0].id, menu: menuEntry};
        selectedView = 'tickets';
    }
    else
    {
        msgText = obj[0].innerText;
        dialogId = md5(Math.random().toString());
        dialogData = {};
        selectedView = '';
    }

    var defaultLanguage = DataEngine.defaultLanguage, i;
    defaultLanguage = ($.inArray(defaultLanguage, lzm_chatDisplay.translationLangCodes) != -1) ? defaultLanguage : ($.inArray(defaultLanguage.split('-')[0], lzm_chatDisplay.translationLangCodes) -1) ? defaultLanguage.split('-')[0] : 'en';

    var bodyString = '<fieldset id="obj-translator-original" class="lzm-fieldset">' +
        '<legend>' + t('Original') + '</legend><select id="obj-translator-orig-select" class="lzm-select ui-disabled"><br /><option value="">' + t('Auto-Detect') + '</option>';
    bodyString += '</select><textarea id="obj-translator-orig-text" class="obj-reply-text" style="padding: 4px;">' + msgText + '</textarea>' +
        '</fieldset><fieldset id="obj-translator-translation" class="lzm-fieldset" data-role="none" style="margin-top: 5px;">' +
        '<legend>' + t('Translation') + '</legend><select id="obj-translator-translated-select" class="lzm-select"><br />';

    for (i=0; i<lzm_chatDisplay.translationLanguages.length; i++)
    {
        var selectedString = (lzm_chatDisplay.translationLanguages[i].language == defaultLanguage) ? ' selected="selected"' : '';
        bodyString += '<option' + selectedString + ' value="' + lzm_chatDisplay.translationLanguages[i].language + '">' + lzm_chatDisplay.translationLanguages[i].language.toUpperCase() + ' - ' + lzm_chatDisplay.translationLanguages[i].name + '</option>'
    }
    bodyString += '</select><textarea id="obj-translator-translated-text" class="obj-reply-text" style="padding: 4px;"></textarea></fieldset>';

    lzm_displayHelper.minimizeDialogWindow(dialogId, dialogName, dialogData, selectedView, false);
    lzm_displayHelper.createDialogWindow(headerString,bodyString, footerString,dialogName, {}, {}, {}, {}, '', dialogData, false, false, dialogId + '_translator');
    UIRenderer.resizeObjTranslator();

    var fillTranslatedText = function(sourceLanguage, targetLanguage) {
        var gUrl = 'https://www.googleapis.com/language/translate/v2';
        var dataObject = {key: DataEngine.otrs,
            target: targetLanguage, q: $('#obj-translator-orig-text').val()};
        if (sourceLanguage != '') {
            dataObject.source = sourceLanguage;
        }
        $.ajax({
            type: "GET",
            url: gUrl,
            data: dataObject,
            dataType: 'json'
        }).done(function(data) {
                $('#obj-translator-translated-text').val(data.data.translations[0].translatedText);
            }).fail(function (jqXHR, textStatus, errorThrown) {
                deblog(jqXHR);
                deblog(jqXHR.status);
                deblog(textStatus);
                deblog(errorThrown);
            });
    };

    function updateChatMsg(text,att)
    {
        var myCurrentChat = DataEngine.ChatManager.GetChat(ChatManager.ActiveChat);
        var orgpost =  lzm_commonTools.GetElementByProperty(myCurrentChat.Messages,'id',obj[1]);
        if(orgpost.length)
        {
            orgpost = orgpost[0];
            lzm_commonTools.RemoveElementByProperty(that.translatedPosts,'id',orgpost.id);
            if(!att)
                that.translatedPosts.push({id:orgpost.id,text:text});
            else
                that.translatedPosts.push({id:orgpost.id,text:orgpost.text + '<br><span class="lz_message_translation">' + text + '</span>'});
            that.DrawChat();
        }
    }

    fillTranslatedText('', defaultLanguage);
    $('#obj-translator-translated-select').change(function() {
        fillTranslatedText($('#obj-translator-orig-select').val(), $('#obj-translator-translated-select').val());
    });
    $('#obj-translator-orig-select').change(function() {
        fillTranslatedText($('#obj-translator-orig-select').val(), $('#obj-translator-translated-select').val());
    });
    $('#translate-obj-retranslate').click(function() {
        fillTranslatedText($('#obj-translator-orig-select').val(), $('#obj-translator-translated-select').val());
    });
    $('#translate-obj-replace').click(function() {
        var translatedText = $('#obj-translator-translated-text').val();
        $('#translate-obj-cancel').click();
        if(type=='ticket')
            saveTicketTranslationText(obj[0], obj[1], translatedText);
        else
            updateChatMsg(translatedText,false);
    });
    $('#translate-obj-attach').click(function() {
        if(type=='ticket')
            saveTicketTranslationText(obj[0], obj[1], msgText + '\r\n\r\n' + $('#obj-translator-translated-text').val());
        else
            updateChatMsg($('#obj-translator-translated-text').val(),true);
        $('#translate-obj-cancel').click();
    });
    if(type=='ticket')
        $('#translate-obj-comment').click(function() {
            var translatedText = $('#obj-translator-translated-text').val();
            $('#translate-obj-cancel').click();
            if(type=='ticket')
                saveTicketTranslationText(ticket, msgNo, translatedText, 'comment');
        });
    $('#translate-obj-cancel').click(function() {
        lzm_displayHelper.removeDialogWindow(dialogName);
        //lzm_displayHelper.maximizeDialogWindow(dialogId);
    });
};

CommonUIClass.prototype.RemoveAllContextMenus = function(){
    removeTicketContextMenu();
    removeArchiveFilterMenu();
    removeQrdContextMenu();
    removeTicketMessageContextMenu();
    removeTicketFilterMenu();
    removeVisitorListContextMenu();
    removeOperatorListContextMenu();
    removeChatMembersListContextMenu();
    removeReportFilterMenu();
    removeReportContextMenu();
    removeChatLineContextMenu();
    removeFiltersListContextMenu();
    removeVisitorChatActionContextMenu();
    removeArchiveListContextMenu();
    ContextMenuClass.RemoveAll();
};

CommonUIClass.__ShowChatMsgTranslator = function() {
    var field = CommonUIClass.TranslateChatPost;
    if(!$(field).hasClass('RCMT'))
        showTranslationDialog('chat',[$(field).find('div span')[0],$(field).data('pn')]);
};

var HeartBeatActions = function (_playNow) {

    if(DataEngine.myId != '')
    {
        lzm_chatDisplay.HeartBeatCounter++;

        if(IFManager.IsDesktopApp())
        {
            var st = ChatPollServerClass.__UserStatus;
            if(lzm_chatDisplay.HeartBeatCounter%2==0)
            {
                if(DataEngine.ChatManager.IsUnread())
                    st=4;
                else if(ChatTicketClass.IsUnreadTicket)
                    st=5;
            }
            IFManager.IFSetOperatorStatus(st);
        }

        if(lzm_chatDisplay.SoundIntervalRing && (lzm_chatDisplay.HeartBeatCounter%3==0 || _playNow))
        {
            IFManager.IFPlaySound('ringtone',lzm_chatDisplay.volume/100);
        }
        else if(lzm_chatDisplay.SoundIntervalQueue)
        {
            if(lzm_chatDisplay.HeartBeatCounter%10==0 || _playNow)
            {
                if(!IFManager.IsAppFrame || IFManager.IsDesktopApp())
                    IFManager.IFPlaySound('queue',lzm_chatDisplay.volume/100);
            }
        }

        if (!IFManager.IsAppFrame && !IFManager.IsMobileOS)
        {
            if (doBlinkTitle && blinkTitleMessage != '')
            {
                var newTitle = (lzm_chatDisplay.HeartBeatCounter%2==0) ? blinkTitleMessage : DataEngine.siteName;
                $('title').html(newTitle);
            }
            else
            {
                $('title').html(DataEngine.siteName);
            }
        }
    }
};
