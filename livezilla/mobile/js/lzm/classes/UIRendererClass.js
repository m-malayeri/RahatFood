/****************************************************************************************
 * LiveZilla UIRendererClass.js
 *
 * Copyright 2017 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function UIRendererClass() {
    this.windowWidth = 0;
    this.windowHeight = 0;
    this.maxWindowHeight = 0;
    this.chatPageHeight = 0;
    this.chatPageTop = 0;
    this.mainMenuPosition = {top: 13, left: 15};
    this.mainMenuHeight = 40;
    this.mainMenuWidth = 0;
    this.viewSelectPanelHeight = 31;
    this.viewContainerHeight = 0;
    this.viewContainerWidth = 0;
    this.viewContainerCss = {};
}

UIRendererClass.prototype.resizeAll = function() {
    this.windowWidth = $(window).width();
    this.windowHeight = $(window).height();
    this.mainMenuWidth = this.windowWidth - 32;
    if (this.windowHeight > this.maxWindowHeight) {
        this.maxWindowHeight = this.windowHeight;
    }
    this.chatPageHeight = this.windowHeight;
    //this.chatPageLeft = this.mainMenuPosition.left;
    this.chatPageTop = this.mainMenuPosition.top + this.mainMenuHeight + this.viewSelectPanelHeight + 10;
    if (IFManager.IsAppFrame && this.windowHeight < 390) {
        this.chatPageHeight = Math.min(390, this.maxWindowHeight);
    }
    this.viewContainerHeight = this.chatPageHeight - this.chatPageTop - 27;
    this.viewContainerWidth = this.mainMenuWidth - 10;

    this.viewContainerCss = {position: 'absolute', width: this.viewContainerWidth+'px', height: this.viewContainerHeight+'px',
        padding: '5px 5px 5px 5px', left: '0px', top: '2px', display: 'block', border: '1px solid #cccccc', 'border-radius': '4px',
        overflow: 'hidden', background: '#ffffff'};

    this.resizeStartPage();
    this.resizeMychats();
    this.resizeTicketList();
    this.resizeArchive();
    this.resizeOperatorList();
    this.ResizeVisitorList();
    this.resizeFilter();
    this.resizeAllChats();
    this.resizeReportList();
    this.resizeTicketDetails();
    this.resizeEmailDetails();
    this.resizeOptions();
    this.resizeResources();
    this.resizeAddResources();
    this.resizeEditResources();
    this.resizeResourceSettings();
    this.resizeTicketReply();
    this.resizeVisitorDetails();
    this.resizeVisitorInvitation();
    this.resizeOperatorForwardSelection();
    this.resizeMessageForwardDialog();
    this.resizeArchivedChat();
    this.resizeDynamicGroupDialogs();
    this.resizeTranslateOptions();
    this.resizeChatView();
    this.resizeTranslationEditor();
    this.resizeFilterCreation();
    this.resizeFilterList();
    this.resizeLinkGenerator();
    this.resizeSendTranscriptDialog();
    this.resizeObjTranslator();
    this.resizeTicketLinker();
    this.resizeUserManagement();
    this.resizePhoneCall();
    this.resizeMenuPanels();

    try {
        lzm_commonDialog.resizeAlertDialog();
        lzm_commonDialog.resizePasswordChange();
    } catch(ex) {}
};

UIRendererClass.prototype.resizeTicketDetails = function(){
    var myHeight = Math.max($('#ticket-details-body').height(), $('#email-list-body').height());
    myHeight = Math.max(myHeight, $('#visitor-information-body').height());
    var navHeightOuter = 70;
    var historyHeight;
    var fullScreenMode = lzm_chatDisplay.ticketDisplay.isFullscreenMode();
    historyHeight = Math.floor((myHeight-navHeightOuter)*0.4);

    $('#ticket-comment-list-frame').css({height: 'calc(100% - 31px)'});
    $('#ticket-attachment-list').css({'height': 'calc(100%)'});
    $('#ticket-ticket-details').css({'min-height': (historyHeight - 22) + 'px'});
    $('#ticket-new-input').css({height: '100%'});
    $('#comment-text').css({'min-height': (myHeight - 22)+'px'});
    $('#phone-call-phonenumber-inner').css({'min-height': (myHeight - 63)+'px'});
    $('#phone-number-container').css({height: '65px','margin-top': '15px'});
    $('#phone-country-code-container').css({height: '65px', 'margin-top': '10px'});
    $('#change-message-text').css({width: '100%', height: '100%'});

    if(fullScreenMode){
        $('#ticket-history-div').css({position:'absolute',left:0,top:0,bottom:0,width:'301px','border-right':'1px dotted #fff',overflow:'hidden'});
        $('#ticket-details-div').css({position:'absolute',right:0,top:0,bottom:0,left:'302px','border-left':'1px solid #ccc',overflow:'hidden'});
        $('#ticket-details-placeholder').css({height:'100%','overflow-y':'auto'});
        $('#ticket-history-placeholder').css({height:'100%','overflow-y':'auto'});
        $('.ticket-history-placeholder-content').css({height: (myHeight-25) + 'px'});
        $('.ticket-details-placeholder-content').css({height: (myHeight-25) + 'px'});
        $('#ticket-message-text').css({padding:'10px','height': (myHeight - $('#ticket-message-details').height() -53) + 'px'});
        $('#ticket-message-list').css({'min-height': (historyHeight - 22) + 'px'});
    }
    else
    {
        $('.ticket-details-placeholder-content').css({height: '100%'});
        $('#ticket-message-text').css({'height': (myHeight - $('#ticket-message-details').height() - 80) + 'px'});
        $('#ticket-message-list').css({'height': (myHeight - 41) + 'px'});
    }

    var height = $('#ticket-attachment-list').height()-$('#attachment-table').height()-8;
    $('#att-img-preview-field').css({'height':height+'px'});
};

UIRendererClass.prototype.resizeTicketReply = function() {
    if ($('#ticket-details-body').length > 0)
    {
        var displayViews = {'reply': 2, 'preview': 1};
        var tabControlWidth = 0, ticketDetailsBodyHeight = $('#ticket-details-body').height();

        for (var view in displayViews)
            if (displayViews.hasOwnProperty(view))
                if ($('#' + view + '-placeholder-content-' + displayViews[view]).css('display') == 'block')
                    tabControlWidth = $('#' + view + '-placeholder-content-' + displayViews[view]).width();

        $('.reply-placeholder-content').css({height: (ticketDetailsBodyHeight - 24) + 'px'});
        $('#message-attachment-list').css({'min-height': (ticketDetailsBodyHeight - 62) + 'px'});

        if (tabControlWidth != 0)
            $('#preview-comment-text').css({'min-height': (ticketDetailsBodyHeight - 62) + 'px'});

        var replyTextHeight = ($('#ticket-reply-files').length) ? $('#ticket-details-body').height() - $('#ticket-reply-files').height() - 345 : $('#ticket-details-body').height() - 295;

        if ($('#ticket-reply-subject').prop('type')=='hidden')
            replyTextHeight += 32;

        $('#new-message-comment').css({'min-height': '60px'});
        $('#ticket-reply-text').css({'height': replyTextHeight+'px'});
    }
};

UIRendererClass.prototype.resizeEmailDetails = function() {
    if ($('#email-list-body').length > 0) {
        var myHeight = $('#email-list-body').height() + 10;
        var listHeight = Math.floor(Math.max(myHeight / 2, 175) - 45);
        var contentHeight = (myHeight - listHeight) - 93;
        var contentWidth = $('#email-list-body').width() + 10;
        $('.email-list-placeholder-content').css({height: listHeight + 'px'});
        $('.email-placeholder-content').css({height: (contentHeight + 34) + 'px'});
        $('#incoming-email-list').css({'min-height': (listHeight - 22) + 'px'});
        $('#email-text').css({'height': ($('.email-placeholder-content').height() - 74) + 'px'});
        $('#email-content').css({'min-height': (contentHeight - 22) + 'px'});
        $('#email-html').css({'min-height': (contentHeight - 22) + 'px'});
        $('.html-email-iframe').css({width: (contentWidth - 52) + 'px', height: (contentHeight - 40) + 'px'});
        $('#email-attachment-list').css({'min-height': (contentHeight - 22) + 'px'});
    }
};

UIRendererClass.prototype.resizeOptions = function() {

    if ($('#user-settings-dialog-body').length > 0) {
        var tabContentHeight = $('#user-settings-dialog-body').height() - 25;
        $('.settings-placeholder-content').css({height: tabContentHeight+'px'});
        $('#view-select-settings').css({'min-height': (tabContentHeight - 35) + 'px'});
        $('#about-settings').css({'min-height': (tabContentHeight - 35) + 'px'});
        $('#tos').css({'min-height': (tabContentHeight-3) + 'px'});
    }
};

UIRendererClass.prototype.resizeUserControlPanel = function() {
    var userstatusButtonWidth = 50;
    var usersettingsButtonWidth = 150;
    var mainArticleWidth = $('#content_chat').width();
    if (mainArticleWidth > 380) {
        usersettingsButtonWidth = 250;
    } else if (mainArticleWidth > 355) {
        usersettingsButtonWidth = 225;
    } else if (mainArticleWidth > 330) {
        usersettingsButtonWidth = 200;
    } else if (mainArticleWidth > 305) {
        usersettingsButtonWidth = 175;
    }
    var wishlistButtonWidth = 40;
    lzm_chatDisplay.blankButtonWidth = mainArticleWidth - userstatusButtonWidth - usersettingsButtonWidth - wishlistButtonWidth - 5;
    $('#userstatus-button').css({width: userstatusButtonWidth+'px'});
    $('#usersettings-button').css({width: usersettingsButtonWidth+'px'});
    $('#wishlist-button').css({width: wishlistButtonWidth+'px'});
    $('#blank-button').css({width: lzm_chatDisplay.blankButtonWidth+'px'});
    $('#wishlist-button').children('.ui-btn-inner').css({'padding-left': '0px'});
    $('#blank-button').find('.ui-btn-inner').css({'padding-left': '3px', 'padding-right': '5px'});
    if (lzm_chatDisplay.debuggingDisplayWidth != mainArticleWidth) {
        lzm_chatDisplay.debuggingDisplayWidth = mainArticleWidth;
    }
};

UIRendererClass.prototype.resizeResources = function() {
    var resultListHeight;
    if ($('#qrd-tree-body').children('div').length > 0)
    {
        var bh =$('#qrd-tree-body').height();

        resultListHeight = $('#qrd-tree-body').height() - $('#search-input').height() - 97;
        $('#search-results').css({'min-height': resultListHeight + 'px'});

        var sp = lzm_chatDisplay.resourcesDisplay.ShowPreview && lzm_chatDisplay.windowWidth > 800;
        $('#all-resources').css({height: (bh-23) + 'px',width : (sp) ? (lzm_chatDisplay.windowWidth - 500) + 'px' : '100%'});
        $('#all-resources-preview').css({display: (sp) ? 'block' : 'none',left:(lzm_chatDisplay.windowWidth - 500) + 'px',height: (bh-43) + 'px'});

        if(sp && lzm_chatDisplay.resourcesDisplay.SelectedResourceTab==0)
            $('#preview-qrd').addClass('lzm-button-b-pushed');
        else
            $('#preview-qrd').removeClass('lzm-button-b-pushed');

    }
    else if($('#qrd-tree-dialog-body').length > 0)
    {
        $('.qrd-tree-placeholder-content').css({height: ($('#qrd-tree-dialog-body').height() - 40) + 'px'});
        resultListHeight = $('#qrd-tree-dialog-body').height() - $('#search-input').height() - 89;
        $('#search-results').css({'min-height': resultListHeight + 'px'});
        $('#all-resources-dialog').css({'min-height': ($('#qrd-tree-dialog-body').height() - 62) + 'px'});
    }
};

UIRendererClass.prototype.resizeAddResources = function() {
    if ($('#qrd-add-body').length > 0 || $('#qrd-tree-dialog-body').length > 0 || $('#ticket-details-body').length > 0) {
        var myHeight = Math.max($('#qrd-add-body').height(), $('#qrd-tree-dialog-body').height(), $('#ticket-details-body').height());
        var qrdTextHeight = myHeight - 135;
        var thisQrdTextInnerCss = {height:  (qrdTextHeight +26)+'px',border: '1px solid #ccc','background-color': '#f5f5f5'};
        var thisQrdTextInputCss = {height: (qrdTextHeight +26)+'px','box-shadow': 'none', 'border-radius': '0px', padding: '0px', margin: '0px', border: '1px solid #ccc'};
        var thisTextInputBodyCss = {height: (qrdTextHeight - 5)+'px','box-shadow': 'none', 'border-radius': '0px', padding: '0px', margin: '0px','background-color': '#ffffff', 'overflow-y': 'hidden', 'border-top': '1px solid #ccc'};
        $('#qrd-add-text-inner').css(thisQrdTextInnerCss);
        $('#qrd-add-text').css(thisQrdTextInputCss);
        $('#qrd-add-text-body').css(thisTextInputBodyCss);
        $('#qrd-add-url-icon').css({top: '0px'});
        $('#qrd-add-url-text').css({top: '0px'});
        $('#file-drop-box').css({height: (myHeight-33)});
    }
};

UIRendererClass.prototype.resizeEditResources = function() {
    if ($('#edit-resource').length > 0)
    {
        var myHeight = Math.max($('#qrd-edit-body').height(), $('#qrd-tree-dialog-body').height(), $('#ticket-details-body').height());
        var qrdTextHeight = myHeight - 140;
        var thisQrdTextInnerCss = {width:'100%', height:  (qrdTextHeight +25)+'px', border: '1px solid #ccc','background-color': '#f5f5f5'};
        var thisQrdTextInputCss = {height: (qrdTextHeight +25)+'px','box-shadow': 'none', 'border-radius': '0px', padding: '0px', margin: '0px', border: '1px solid #ccc'};
        var thisTextInputBodyCss = {height: (qrdTextHeight - 6)+'px','box-shadow': 'none', 'border-radius': '0px', padding: '0px', margin: '0px','background-color': '#ffffff', 'overflow-y': 'hidden', 'border-top': '1px solid #ccc'};
        $('#edit-resource').css({'height': (myHeight - 70) +'px'});
        $('#qrd-edit-text-inner').css(thisQrdTextInnerCss);
        $('#qrd-edit-text').css(thisQrdTextInputCss);
        $('#qrd-edit-text-body').css(thisTextInputBodyCss);
        $('#qrd-edit-url-icon').css({top: '0px'});
        $('#qrd-edit-url-text').css({top: '0px'});
    }
};

UIRendererClass.prototype.resizeResourceSettings = function() {
    if ($('#qrd-settings').length > 0 || $('#qrd-add').length > 0 || $('#qrd-edit').length > 0)
    {
        var myHeight = Math.max(Math.max($('#qrd-settings-body').height(), $('#qrd-add-body').height()), $('#qrd-edit-body').height());
        var tagsInputHeight = Math.max(200, myHeight - 75);
        var langFsHeight = Math.max(0, myHeight - $('#qrd-knb-pub-acc-fs').height() - $('#qrd-knb-search-fs').height() - $('#qrd-knb-shortcuts-fs').height() - 162);

        $('.qrd-settings-placeholder-content').css({'min-height': (myHeight - 41)+'px'});
        $('#qrd-tags-input').css({height: tagsInputHeight+'px', padding: '4px'});
        $('#qrd-knb-shortcuts-text-container').css({height: '50px'});
    }
};

UIRendererClass.prototype.resizeVisitorDetails = function() {

    $('.dialog-visitor-info, .embedded-visitor-info').each(function(){
        var dialog = $(this).attr('class')=='dialog-visitor-info';
        var elementId = ((!dialog) ? 'e-' : 'd-') + $(this).attr('data-visitor-id');

        var contentHeight = (dialog) ? $('#visitor-info-'+elementId+'-placeholder').parent().height()-31 : $('#chat-info-body').height()-30;
        var visBodyWidth = (dialog) ? $('#visitor-info-'+elementId+'-placeholder').parent().width() : $('#chat-info-body').width()-8;
        var upperFieldsetHeight = Math.floor(contentHeight / 3);
        var lowerFieldsetHeight = contentHeight - upperFieldsetHeight - 49;

        $('#visitor-history-'+elementId+'-placeholder').css({height: (contentHeight + 6) + 'px'});
        $('.visitor-history-'+elementId+'-placeholder-content').css({height: (contentHeight - 18) + 'px'});
        $('.browser-history-container').css({height: (contentHeight - 18) + 'px'});
        $('.visitor-info-placeholder-content').css({height: (contentHeight + 7) + 'px'});
        $('#visitor-comment-'+elementId+'-list-frame').css({'height': (contentHeight - 26) + 'px'});
        $('#visitor-invitation-'+elementId+'-list').css({'height': (contentHeight + 5) + 'px'});
        $('#visitor-details-'+elementId+'-list').css({'height': (contentHeight + 7) + 'px'});
        $('#visitor-cobrowse-'+elementId).css({'min-height': (contentHeight - 22) + 'px'});
        $('#visitor-cobrowse-'+elementId+'-browser-select').css({'min-width': '0px', width: (visBodyWidth - 40)+'px'});

        if ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
            $('#visitor-cobrowse-'+elementId+'-iframe').css({'min-width': '0px', height: (contentHeight - 70)+'px'});
        else
            $('#visitor-cobrowse-'+elementId+'-iframe-container').css({'min-width': '0px', height: (contentHeight - 70)+'px'});

        $('#matching-tickets-'+elementId+'-inner').css({overflow:'auto','height': (upperFieldsetHeight+31) + 'px'});
        $('#ticket-content-'+elementId+'-inner').css({overflow:'auto',height: (lowerFieldsetHeight+4) + 'px'});

        $('#matching-chats-'+elementId+'-inner').css({overflow:'auto','height': upperFieldsetHeight + 'px'});
        $('#chat-content-'+elementId+'-inner').css({overflow:'auto',height: (lowerFieldsetHeight+24) + 'px'});
    });
};

UIRendererClass.prototype.resizeVisitorInvitation = function() {
    if ($('#chat-invitation-body').length > 0) {
        var invTextHeight = Math.max((lzm_chatDisplay.dialogWindowHeight - 280), 100);
        $('#invitation-text-div').css({height:  invTextHeight+'px'});

        $('#invitation-text-inner').css({height:  (invTextHeight - 42)+'px'});
        $('#invitation-text').css({height: (invTextHeight - 34)+'px'});

        if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
            $('#invitation-text-body').css({height: (invTextHeight - 73)+'px'});
    }
};

UIRendererClass.prototype.resizeOperatorForwardSelection = function() {
    if ($('#operator-forward-selection-body').length > 0) {
        var fwdTextHeight = Math.max((lzm_chatDisplay.dialogWindowHeight - 235), 100);
        $('#forward-receiver').css({height: (fwdTextHeight) + 'px'});
    }
};

UIRendererClass.prototype.resizeMessageForwardDialog = function() {
    if ($('#message-forward-placeholder').length > 0) {
        //var contentHeigth = $('#ticket-details-body').height() - 40;
        //$('.message-forward-placeholder-content').css({height: contentHeigth + 'px'});
        var inputMaxWidth = $('#message-forward-placeholder-content-0').width() - 18;
        /*if (lzm_displayHelper.checkIfScrollbarVisible('message-forward-placeholder-content-0')) {
            inputMaxWidth -= lzm_displayHelper.getScrollBarWidth();
        }*/
        var filesHeight = (!isNaN(parseInt($('#forward-files').height()))) ? $('#forward-files').height() + 45 : 0;
        //var inputWidth = Math.min(500, inputMaxWidth);
        //$('#forward-email-addresses').css({width: inputWidth});
        //$('#forward-subject').css({width: inputWidth});
        $('#forward-text').css({height: Math.max(100, $('#ticket-details-body').height() - 180 - filesHeight) + 'px'});
    }
};

UIRendererClass.prototype.resizeArchivedChat = function(elementId) {

    if ($('#matching-chats-body').length > 0) {
        var contentHeight = $('#matching-chats-body').height()-30;
        var upperFieldsetHeight = Math.floor(contentHeight / 3);
        var lowerFieldsetHeight = contentHeight - upperFieldsetHeight - 49;
        $('#matching-chats-'+elementId+'-inner').css({overflow:'auto','height': upperFieldsetHeight + 'px'});
        $('#chat-content-'+elementId+'-inner').css({overflow:'auto',height: (lowerFieldsetHeight+3) + 'px'});
    }
};

UIRendererClass.prototype.resizeFilterCreation = function() {
    if ($('#visitor-filter-body').length > 0) {
        var myHeight = $('#visitor-filter-body').height();
        var mainTableHeight = $('#visitor-filter-main-table').height();
        var baseTableHeight = $('#visitor-filter-base-table').height();
        var appliesTableHeight = $('#visitor-filter-applies-table').height();
        var fieldsetAddedheight = Math.floor((myHeight - 20 - 38 - (mainTableHeight + 22) - (baseTableHeight + 22) - (appliesTableHeight + 22)) / 3);
        var mainFieldsetHeight = mainTableHeight + fieldsetAddedheight;
        var baseFieldsetHeight = baseTableHeight + fieldsetAddedheight;
        var appliesFieldsetHeight = appliesTableHeight + fieldsetAddedheight;
        $('.visitor-filter-placeholder-content').css({height: '100%'});
        $('#visitor-filter-main').css({'min-height': mainFieldsetHeight + 'px'});
        $('#visitor-filter-base').css({'min-height': baseFieldsetHeight + 'px'});
        $('#visitor-filter-applies').css({'min-height': appliesFieldsetHeight + 'px'});
    }
};

UIRendererClass.prototype.resizeFilterList = function() {
    if ($('#filter-list').length > 0) {
        $('#filter-list-body').css({'overflow-x': 'auto'});
    }
};

UIRendererClass.prototype.resizeLinkGenerator = function() {
    if ($('#link-generator').length > 0) {
        $('#link-generator-body').css({'overflow-x': 'hidden'});

        var myHeight = $('#link-generator-body').height()-95;
        $('#elements-list-div, #code-list-div').css({'min-height': myHeight + 'px'});


    }
};

UIRendererClass.prototype.resizeDynamicGroupDialogs = function() {
    if ($('#dynamic-group-body').length > 0) {
        var bodyHeight = $('#dynamic-group-body').height();
        var addNewGroupFormHeight = $('#add-new-group-form').height();
        var addPersistentMemberFormHeight = $('#add-persistent-member-form').height();
        var newGroupFormHeight = bodyHeight - 22;
        var addToGroupFormHeight = bodyHeight - addNewGroupFormHeight - addPersistentMemberFormHeight - 77;


    }
};

UIRendererClass.prototype.resizeTranslateOptions = function() {
    if ($('#translate-options-body').length > 0) {
        var myHeight = $('#translate-options-body').height();
        var myWidth = $('#translate-options-body').width();
        //$('.translate-options-placeholder-content').css({'height': (myHeight - 40)+'px'});
        //$('#translate-my-messages').css({'min-height': (myHeight - 62)+'px'});
        //$('#translate-visitor-messages').css({'min-height': (myHeight - 62)+'px'});
        //$('.translation-language-select').css({'min-width': '0px', width: (myWidth - 50)+'px'});
    }
};

UIRendererClass.prototype.resizeChatView = function() {
    return;
    /*
    if ($('#no-open-chats-message').length > 0) {
        var myWidth = $('#chat-progress').width();
        var myHeight = $('#chat-progress').height();
        var textWidth = $('#no-open-chats-message').width();
        var textHeight = $('#no-open-chats-message').height();
        var textLeft = Math.round((myWidth - textWidth) / 2);
        var textTop = Math.round((myHeight - textHeight) / 2);
        var noOpenMessageCss = {left: textLeft+'px', top: textTop+'px'};
        $('#no-open-chats-message').css(noOpenMessageCss);
    }
    */
    //$('#chat-members').css({left: ($('#chat-container').width()-lzm_chatDisplay.memberListWidth) + 'px'});
};

UIRendererClass.prototype.resizeMenuPanels = function() {
    var settingsButtonWidth = (this.windowWidth > 500) ? 250 : (this.windowWidth > 400) ? 200 : 150;
    $('#main-menu-panel-settings').css({width: (settingsButtonWidth)+'px'});
    $('#main-menu-panel-settings-text').css({width: (settingsButtonWidth - 50)+'px'});
    $('.main-menu-panel-opt-tools').css({display: (this.windowWidth>550) ? 'inline-block' : 'none'});
    $('#main-menu-panel-tools').css({left: (settingsButtonWidth + 53)+'px'});
    $('#main-menu-info-box').css('display',(this.windowWidth > 1000) ?  'block' : 'none');
};

UIRendererClass.prototype.resizeStartPage = function() {
    if (lzm_chatDisplay.selected_view == 'home') {
        var startPageIframeCss = {border: '0px', width: '100%', height: '99%',
            'background-color': '#ffffff'};
        var numberOfStartPages = (lzm_chatDisplay.startPages.show_lz == 1) ? 1 : 0;
        for (var i=0; i<lzm_chatDisplay.startPages.others.length; i++) {
            numberOfStartPages++;
        }
        if (numberOfStartPages == 1) {
            this.resizeSingleStartPage();
        } else if (numberOfStartPages > 1)
        {
            $('.startpage-iframe').css(startPageIframeCss);
            $('.startpage-placeholder-content').css({'position': 'relative', 'min-height': (this.viewContainerHeight)+'px'})
            $('#startpage-placeholder-tabs-row').css({'margin-top': '4px','border':0})
        }
    }
};

UIRendererClass.prototype.resizeSingleStartPage = function() {
    if ($('#single-startpage-iframe').length > 0) {
        var myWidth = $('#startpage-body').width();
        var myHeight = $('#startpage-body').height();

        $('#single-startpage-iframe').css({width: '100%', height: '99%'});
    }
};

UIRendererClass.prototype.resizeMychats = function() {
    if (lzm_chatDisplay.selected_view == 'mychats')
    {
        var chatInfoWidth = 650;
        var mychatsInputControlsCss = {position: 'absolute', width: '0px', height: '0px', border: '0px', left: '0px', top: '0px', display: 'none'};
        var mychatsInputBodyCss = {position: 'absolute', right: 0, bottom:0,border: '0px', 'border-bottom-left-radius': '4px', 'border-bottom-right-radius': '4px', left: '0px', top: '0px','overflow-y': 'hidden'};
        var mychatsInputCss = {position: 'absolute', right:0, bottom:0, border: '0px', 'border-bottom-left-radius': '4px', 'border-bottom-right-radius': '4px', left: '0px', top: '0px','text-align': 'left', 'font-size': '12px', 'overflow': 'hidden'};

        $('#chat-buttons').css({bottom:(ChatEditorClass.ExpandChatInputOffset + 50) + 'px'});
        $('#chat-qrd-preview').css({bottom:(ChatEditorClass.ExpandChatInputOffset + 80) + 'px'});
        $('#chat-action').css({height:(ChatEditorClass.ExpandChatInputOffset + 46) + 'px'});
        $('#chat-members-minimize').css({bottom:(ChatEditorClass.ExpandChatInputOffset + 52) + 'px'});
        $('#chat-input-controls').css(mychatsInputControlsCss);
        $('#chat-input-body').css(mychatsInputBodyCss);
        $('#chat-input').css(mychatsInputCss);
        $('#chat-title').css({display: 'none'});

        var ccw = $('#chat-container').width();
        var cctop = $('#active-chat-panel').outerHeight()+1;

        $('#chat-table').css({top:cctop+'px'});
        $('#chat-info-body').css({left:(ccw-chatInfoWidth)+'px',top:'0'});

        if($('#chat-info-body').data('hidden')=='1' || ccw < CommonUIClass.MinWidthChatVisitorInfo)
        {
            $('#active-chat-panel').css({right:'0'});
            $('#chat-info-body').css({display:'none'});
            $('#chat-table').css({right:'0'});
        }
        else
        {
            $('#chat-info-body').css({display:'block'});
            $('#chat-table').css({right:chatInfoWidth+'px'});
            $('#active-chat-panel').css({right:chatInfoWidth+'px'});
        }
    }
};

UIRendererClass.prototype.resizeTicketList = function() {
    if (lzm_chatDisplay.selected_view == 'tickets')
    {
        var showPreview = (lzm_chatDisplay.windowWidth > 800);
        var showTree = (lzm_chatDisplay.windowWidth > 800) && lzm_commonStorage.loadValue('show_ticket_tree_' + DataEngine.myId) != 0;

        if(showPreview)
        {
            $('#ticket-list-actions').css({display: 'block'});
            $('#ticket-list-right').css({display: 'block'});
            $('#ticket-list-left').css({right: '330px', 'border-width': '1px'});
        }
        else{
            $('#ticket-list-actions').css({display: 'none'});
            $('#ticket-list-right').css({display: 'none'});
            $('#ticket-list-left').css({right: '0px', 'border-width': '0px'});
        }

        if(showTree || lzm_chatDisplay.ticketDisplay.CategorySelect)
        {
            $('#ticket-list-left').css({left: '230px'});
        }
        else
        {
            $('#ticket-list-left').css({left: '0px'});
        }

        if(lzm_chatDisplay.ticketDisplay.CategorySelect)
        {
            $('#ticket-list-tree').css({display: 'block', width: 'auto', right:0, 'border-width' :0});
            $('#ticket-list-left').css({display: 'none'});
        }
        else if(lzm_chatDisplay.windowWidth > 800)
        {
            $('#ticket-list-tree').css({display: 'block', width: '229px', right:'', 'border-width' :'1px'});
            $('#ticket-list-left').css({display: 'block'});
        }
        else if(!lzm_chatDisplay.ticketDisplay.CategorySelect)
        {
            $('#ticket-list-tree').css({display: 'none'});
            $('#ticket-list-left').css({display: 'block'});
        }
    }
};

UIRendererClass.prototype.resizeObjTranslator = function() {
    if ($('#obj-translator-original').length > 0)
    {
        var bodyHeight = $('#obj-translator-body').height();
        var textAreaHeight = Math.floor((bodyHeight - 185) / 2);
        var textAreaCss = {'margin-top': '10px', height: textAreaHeight+'px'};
        $('#obj-translator-orig-text').css(textAreaCss);
        $('#obj-translator-translated-text').css(textAreaCss);
    }
};

UIRendererClass.prototype.resizeTicketLinker = function() {
    if ($('#ticket-linker-first').length > 0) {
        var bodyHeight = Math.max($('#link-chat-ticket-body').height(),$('#ticket-details-body').height());
        var fsHeight = Math.floor(bodyHeight / 2) - 28;
    }
};

UIRendererClass.prototype.resizeArchive = function() {
    if (lzm_chatDisplay.selected_view == 'archive') {
        var showPreview = ($(window).width() > 800);
        if(showPreview){
            $('#archive-list-right').css({display: 'block'});
            $('#archive-list-left').css({left:0,right: '450px', 'border-width': '1px'});
        }
        else{
            $('#archive-list-right').css({display: 'none'});
            $('#archive-list-left').css({left:0,right: '0px', 'border-width': '0px'});
        }
    }
};

UIRendererClass.prototype.resizeQrdTree = function() {
};

UIRendererClass.prototype.resizeOperatorList = function() {
};

UIRendererClass.prototype.ResizeVisitorList = function() {
    if (lzm_chatDisplay.selected_view == 'external')
    {
        var sm = LocalConfiguration.ShowVisitorsMap;
        var tablewp = Math.ceil(this.windowWidth*0.5);

        if(this.windowWidth > 1000)
        {
            $('#visitor-list-table-div').css({display:'block',top:'56px',right:(sm ? ((tablewp) + 'px') : '-1px')});
            $('#geotracking').css({top:'56px',left:tablewp+'px',display:(sm ? 'block' : 'none')});
        }
        else
        {
            $('#visitor-list-table-div').css({top:'56px',right:'-1px',display:(sm ? 'none' : 'block')});
            $('#geotracking').css({top:'56px',left:0,display:(sm ? 'block' : 'none')});
        }
    }
};

UIRendererClass.prototype.resizeFilter = function() {
    if (lzm_chatDisplay.selected_view == 'filter') {
        var filterCss = lzm_commonTools.clone(this.viewContainerCss);
        var headlineCss = this.createHeadlineFromContainer(filterCss);
        var secondHeadlineCss = this.createSecondHeadlineFromContainer(filterCss);
        var bodyCss = this.createBodyFromContainer(filterCss, true, false);
        $('#filter').css(filterCss);
        $('#filter-headline').css(headlineCss);
        $('#filter-headline2').css(secondHeadlineCss);
        $('#filter-body').css(bodyCss);
    }
};

UIRendererClass.prototype.resizeAllChats = function() {
    if (lzm_chatDisplay.selected_view == 'mychats') {
        var allChatsCss = lzm_commonTools.clone(this.viewContainerCss);
        var secondHeadlineCss = this.createSecondHeadlineFromContainer(allChatsCss);
        var bodyCss = this.createBodyFromContainer(allChatsCss, true, false);
        bodyCss.top = '0px';
        bodyCss.height = (parseInt(bodyCss.height) - 30)+'px';
        bodyCss.overflow = 'auto';
        secondHeadlineCss.top = (parseInt(bodyCss.height)  + 10)+'px';

        var showTree = (lzm_chatDisplay.windowWidth > 700);
        var showObserver = (lzm_chatDisplay.windowWidth > 1000);

        if(showTree && showObserver && lzm_chatDisplay.ChatsUI.ObserverModePossible)
        {
            $('#all-chats-body').css({display: 'block',left: '190px',right: lzm_chatDisplay.ChatsUI.ObserverMode ? '401px' : '0'});
            $('#all-chats-preview').css({display: lzm_chatDisplay.ChatsUI.ObserverMode ? 'block' : 'none'});
            $('#all-chats-tree').css({display: 'block',width:'189px',right:''});
            $('#allchats-observer-mode').css({display: 'inline'});
            $('#allchats-tree-switch').css({display: 'none'});
        }
        else if(showTree)
        {
            $('#all-chats-body').css({display: 'block',left: '190px',right:'0'});
            $('#all-chats-preview').css({display: 'none'});
            $('#all-chats-tree').css({display: 'block',width:'189px',right:''});
            $('#allchats-observer-mode').css({display: 'none'});
            $('#allchats-tree-switch').css({display: 'none'});
        }
        else if(lzm_chatDisplay.ChatsUI.CategorySelect)
        {
            $('#all-chats-preview').css({display: 'none'});
            $('#all-chats-tree').css({display: 'block',right:'-1px',width:'auto'});
            $('#all-chats-body').css({display: 'none',left: '190px',right:'0px'});
            $('#allchats-observer-mode').css({display: 'none'});
            $('#allchats-tree-switch').css({display: 'inline'});
        }
        else
        {
            $('#all-chats-preview').css({display: 'none'});
            $('#all-chats-tree').css({display: 'none',right:''});
            $('#all-chats-body').css({display: 'block',left: '0'});
            $('#allchats-observer-mode').css({display: 'none'});
            $('#allchats-tree-switch').css({display: 'inline'});

        }
    }
};

UIRendererClass.prototype.resizeReportList = function() {
    if (lzm_chatDisplay.selected_view == 'reports') {

    }
};

UIRendererClass.prototype.resizeTranslationEditor = function() {
    if ($('#translation-editor').length > 0) {
        var bodyHeight = $('#translation-editor-body').height();
        var bodyWidth = $('#translation-editor-body').width();
        var scrollBarHeight = (lzm_displayHelper.checkIfScrollbarVisible('translation-editor-body', 'horizontal')) ?
            lzm_displayHelper.getScrollBarHeight() : 0;
        var fsScrollbarIsVisible = (lzm_chatDisplay.FullscreenDialogWindowWidth <= 1030) ? 'scroll' : 'hidden';
        var fsScrollBarHeight = (lzm_chatDisplay.FullscreenDialogWindowWidth <= 1030) ? lzm_displayHelper.getScrollBarHeight() : 0;
        var colHeight = bodyHeight - scrollBarHeight - fsScrollBarHeight - 38;
        var pfxArray = ['', 'srv-'];
        var langSelColWidth = 250;
        var langTableWidth = langSelColWidth - 22;
        var editorColWidth = Math.max(750, bodyWidth - langSelColWidth - 20);
        //$('#translation-editor-body').css({'overflow': 'auto'});
        $('.translation-editor-placeholder-content').css({position: 'relative', height: (bodyHeight - 25)+'px', 'overflow-y': 'hidden', 'overflow-x': fsScrollbarIsVisible});
        $('#translation-editor-placeholder-tabs-row').css({position: 'relative', 'z-index': 1});
        for (var i=0; i<pfxArray.length; i++) {
            var pfx = pfxArray[i];


            $('#' + pfx + 'translation-language-selection').css({position: 'absolute', left: '5px', top: '4px', width: langSelColWidth+'px', height: colHeight+'px'});
            $('#' + pfx + 'translation-string-editor').css({position: 'absolute', left: '263px', top: '4px', width: editorColWidth+'px', height: colHeight+'px'});
            $('#' + pfx + 'translation-language-selection-inner').css({'min-height': (colHeight - 22)+'px'});
            $('#' + pfx + 'translation-string-editor-inner').css({'min-height': (colHeight - 22)+'px'});
            $('#' + pfx + 'translation-languages-bottom').css({position: 'absolute', bottom: '0px'});
            var leftButtonsHeight = $('#' + pfx + 'translation-languages-bottom').height();
            $('#' + pfx + 'translation-languages-top').css({position: 'absolute', top: '28px', height: (colHeight - leftButtonsHeight - 27)+'px', 'overflow-y': 'auto',border: '1px solid #ccc'});
            $('#' + pfx + 'translation-values-bottom').css({position: 'absolute', bottom: '0px', width: (editorColWidth - 20)+'px'});
            var rightButtonsHeight = $('#' + pfx + 'translation-values-bottom').height();
            $('#' + pfx + 'translation-values-top').css({position: 'absolute', top: '28px', height: (colHeight - rightButtonsHeight - 47)+'px', width: (editorColWidth - 22)+'px','overflow-y': 'auto', border: '1px solid #ccc'});
            $('#' + pfx + 'translation-search-string').css({width: '100%'});
            $('#' + pfx + 'translation-language-table').css({'width': langTableWidth+'px'});
            $('.translation-lang-btn').each(function() {
                var myBtnWidth = Math.max(0, $(this).width());
                if (myBtnWidth != 0) {
                    var myLeftPadding = Math.floor((langTableWidth - myBtnWidth) / 2);
                    var myRightPadding = Math.ceil((langTableWidth - myBtnWidth) / 2);
                    $(this).css({'padding-left': myLeftPadding+'px', 'padding-right': myRightPadding+'px'});
                }
            });
            //var columnWidth = $('#' + pfx + 'translation-translated-column').width();
            //$('#' + pfx + 'translation-string-input').css({width: (columnWidth - 20)+'px'});
            //$('#' + pfx + 'translation-string-input').css({width: '100%'});

            // Add Language
            $('#' + pfx + 'translation-string-add-language').css({'min-height': (colHeight + 16)+'px'});
            /*var inputTableWidth = $('#' + pfx + 'add-translation-input-table').width();
            $('#' + pfx + 'select-translation-language').css({width: (inputTableWidth - 6)+'px'});*/
        }
    }
};

UIRendererClass.prototype.resizeSendTranscriptDialog = function() {
    if ($('#send-transcript-to').length > 0) {
        var bodyHeight = $('#send-transcript-to-body').height();
        //var bodyWidth = $('#send-transcript-to-body').width();
        //var emailWidth = Math.min($('#send-transcript-to-inner').width() - 12, 500);

        $('.send-transcript-placeholder-content').css({height: (bodyHeight - 40)+'px'});
        $('#send-transcript-to-inner').css({'min-height': (bodyHeight - 40 - 22)+'px'});
        //$('#send-transcript-to-email').css({'min-width': '0px', width: emailWidth+'px'});
    }
};

UIRendererClass.prototype.resizeUserManagement = function() {
    if ($('#user-management-dialog').length > 0) {
        var myWidth = $('#user-management-dialog-body').width();
        var myHeight = $('#user-management-dialog-body').height();

        $('#user-management-iframe').css({width: (myWidth)+'px', height: (myHeight)+'px'});
    }
};

UIRendererClass.prototype.resizePhoneCall = function() {
  if ($('#phone-call').length > 0) {
      var myHeight = $('#phone-call-body').height();
      $('#phone-call-phonenumber-inner').css({'min-height': (myHeight - 63)+'px'});
      $('#phone-number-container').css({'margin-top': '15px', height: '60px'});
  }
};

/************************************************** Some general tools **************************************************/
UIRendererClass.prototype.createHeadlineFromContainer = function(containerCss) {
    var headlineCss = {position: 'absolute', top: '0px', left: '0px', width: containerCss.width, height: '22px',
        'border-bottom': '1px solid #cccccc', 'border-radius': '0px', 'background-image': 'none',
        'background-color': '#f5f5f5', color: '#333333', 'text-shadow': 'none', 'font-weight': 'bold', 'font-size': '10px',
        'line-height': '0px', 'text-align': 'left', 'padding-left': '10px'};

    return headlineCss;
};

UIRendererClass.prototype.createSecondHeadlineFromContainer = function(containerCss) {
    var headlineCss = {position: 'absolute', top: '23px', left: '0px', width: (parseInt(containerCss.width) + 10)+'px',
        height: '28px', 'background-color': '#ededed', color: '#333333', 'text-shadow': 'none', margin: '0px'};

    return headlineCss;
};

UIRendererClass.prototype.createBodyFromContainer = function (containerCss, withSecondHeadline, withFootline) {
    var bodyHeight = (withSecondHeadline && withFootline) ? this.viewContainerHeight - 66 :
        (withSecondHeadline) ? this.viewContainerHeight - 48 :
            (withFootline) ? this.viewContainerHeight - 41 : this.viewContainerHeight - 23;
    var bodyTop = (withSecondHeadline) ? 51 : 23;
    var bodyCss = {position: 'absolute', 'text-align': 'left', width: containerCss.width, height: bodyHeight+'px',
        top: bodyTop+'px', left: '0px', overflow: 'hidden', padding: '5px', 'text-overflow': 'ellipsis'};

    return bodyCss;
};

UIRendererClass.prototype.createFootlineFromContainer = function(containerCss) {
    var footlineCss = {position: 'absolute', top: (this.viewContainerHeight - 18)+'px', left: '0px',
        width: (parseInt(containerCss.width) + 6)+'px', height: '21px', 'border-radius': '0px',
        'background-color': '#ededed', color: '#333333', 'text-shadow': 'none', 'font-size': '11px', 'line-height': '0px',
        'text-align': 'right', 'padding': '14px 2px 0px'};

    return footlineCss;
};

UIRendererClass.prototype.getForm = function(formType,obj,name) {
    var contentHtml = '';
    var that = this;
    var showIconLine = $(window).width() > 800;
    obj.m_Settings.forEach(function(entry_name) {
        if(entry_name.name==formType){

            var iconcss = (typeof entry_name.iconcss != 'undefined') ? ' style="'+entry_name.iconcss+'";' : '';

            if(showIconLine)
                contentHtml += '<i class="fa fa-'+((typeof entry_name.icon != 'undefined') ? entry_name.icon : 'cogs')+' lzm-tab-scroll-content-icon"'+iconcss+'></i>';

            entry_name.groups.forEach(function(entry_group)
            {
                if($.inArray(obj.m_Type,entry_group.not) === -1 && $.inArray('all',entry_group.not) === -1){
                    var addClass = (typeof entry_group.class != 'undefined') ? ' '+entry_group.class : '';


                    contentHtml += '<fieldset class="lzm-fieldset-full'+addClass+'" id="'+name+'-configuration-'+entry_group.name+'"><legend>' + entry_group.title + '</legend><form>';

                    if(entry_group.custom === true || entry_group.custom == 'top')
                        contentHtml += obj.GetCustomForm(entry_group.name);

                    entry_group.controls.forEach(function(entry_control) {
                        if($.inArray(obj.m_Type,entry_control.not) === -1 && $.inArray('all',entry_control.not) === -1)
                            contentHtml += that.getControlHTML(entry_control);

                    });

                    if(entry_group.custom == 'bottom')
                        contentHtml += obj.GetCustomForm(entry_group.name);




                    contentHtml += '</form></fieldset>';
                }
            });
        }
    });
    contentHtml = '<div class="lzm-tab-scroll-content'+((showIconLine) ? ' lzm-tab-scroll-content-line' : '')+'">'+ contentHtml + '</div>';
    return contentHtml;
};

UIRendererClass.prototype.GetControlValue = function(controlDefinition) {
    if(controlDefinition.type == 'bool' || controlDefinition.type == 'radio')
        return $('#'+UIRenderer.getControlID(controlDefinition)).prop('checked');
    else if(controlDefinition.type == 'hidden' || controlDefinition.type == 'array' || controlDefinition.type == 'password' || controlDefinition.type == 'string' || controlDefinition.type == 'int' || controlDefinition.type == 'color' || controlDefinition.type == 'area')
        return $('#'+UIRenderer.getControlID(controlDefinition)).val();
    else if(controlDefinition.type == 'position')
        return ($(".lzm-position-selected",'#'+UIRenderer.getControlID(controlDefinition)).prop('id').replace(UIRenderer.getControlID(controlDefinition), ''));
    return null;
}

UIRendererClass.prototype.getSettingsProperty = function(settings,propertyName) {
    var prop = null;
    settings.forEach(function(entry_name) {
        entry_name.groups.forEach(function(entry_group) {
            entry_group.controls.forEach(function(entry_control) {
                if(entry_control.name == propertyName)
                    prop = entry_control;
            });
        });
    });
    return prop;
};

UIRendererClass.prototype.getControlID = function(controlDefintion) {
    if(controlDefintion.type == 'bool')
        return 'cb-'+controlDefintion.name;
    else if(controlDefintion.type == 'array')
        return 'sl-'+controlDefintion.name;
    else if(controlDefintion.type == 'color')
        return 'ci-'+controlDefintion.name;
    else if(controlDefintion.type == 'position')
        return 'po-'+controlDefintion.name;
    else if(controlDefintion.type == 'int')
        return 'int-'+controlDefintion.name;
    else if(controlDefintion.type == 'string')
        return 's-'+controlDefintion.name;
    else if(controlDefintion.type == 'radio')
        return 'r-'+controlDefintion.name;
    else if(controlDefintion.type == 'area')
        return 'a-'+controlDefintion.name;
    else
        return controlDefintion.name;
}

UIRendererClass.prototype.getControlHTML = function(controlDefintion) {
    var contentHtml = '';
    var addClass = (typeof controlDefintion.class != 'undefined') ? controlDefintion.class : '';
    if(controlDefintion.type == 'bool')
        contentHtml = lzm_inputControls.createCheckbox(this.getControlID(controlDefintion), controlDefintion.title, controlDefintion.value, addClass, '');
    else if(controlDefintion.type == 'array')
        contentHtml = lzm_inputControls.createSelect(this.getControlID(controlDefintion), addClass, '', '', {position: 'right', gap: '0px'}, {}, '', controlDefintion.options, controlDefintion.value, '');
    else if(controlDefintion.type == 'color')
        contentHtml = lzm_inputControls.createColor(this.getControlID(controlDefintion), addClass, controlDefintion.value, controlDefintion.title, '');
    else if(controlDefintion.type == 'position')
        contentHtml += lzm_inputControls.createPosition(this.getControlID(controlDefintion), controlDefintion.value);
    else if(controlDefintion.type == 'int')
        contentHtml = lzm_inputControls.createInput(this.getControlID(controlDefintion), addClass, controlDefintion.value, controlDefintion.title, '', 'number', '', '', (typeof controlDefintion.titleright != 'undefined') ? controlDefintion.titleright : '');
    else if(controlDefintion.type == 'string' || controlDefintion.type == 'password'){

        var type = (controlDefintion.type == 'password') ? 'password' : 'text';
        var myData = (typeof controlDefintion.dataattr != 'undefined') ? ' data-attr-name="'+controlDefintion.dataattr+'"' : '';
        contentHtml = lzm_inputControls.createInput(this.getControlID(controlDefintion), addClass, controlDefintion.value, controlDefintion.title, '', type, '', myData, '', (typeof controlDefintion.titleleft != 'undefined') ? controlDefintion.titleleft : '');

        if(d(controlDefintion.titlebottom))
            contentHtml += '<div class="top-space-half lzm-info-text text-s">'+controlDefintion.titlebottom+'</div>';
    }
    else if(controlDefintion.type == 'radio')
        contentHtml = lzm_inputControls.createRadio(this.getControlID(controlDefintion), addClass, controlDefintion.group, controlDefintion.title, controlDefintion.value);
    else if(controlDefintion.type == 'div')
        contentHtml = '<div id="'+this.getControlID(controlDefintion)+'"></div>';
    else if(controlDefintion.type == 'label')
        contentHtml = '<label class="'+addClass+'">'+controlDefintion.title+'</label>';
    else if(controlDefintion.type == 'hidden')
        contentHtml = '<input id="'+this.getControlID(controlDefintion)+'" value="'+controlDefintion.value+'" type="hidden" />';
    else if(controlDefintion.type == 'link')
        contentHtml = '<a class="'+addClass+'" style="font-size:12px;" href="'+controlDefintion.value+'" target="_blank">'+controlDefintion.title+'</a>';
    else if(controlDefintion.type == 'area')
        contentHtml = '<div class="top-space"><label>'+controlDefintion.title+'</label></div><div>' + lzm_inputControls.createArea(this.getControlID(controlDefintion), controlDefintion.value, addClass) + "</div>";

    var classes = "";
    if(typeof controlDefintion.top != 'undefined' && controlDefintion.top == 'single')
        classes += " top-space";
    if(typeof controlDefintion.top != 'undefined' && controlDefintion.top == 'half')
        classes += " top-space-half";
    if(typeof controlDefintion.top != 'undefined' && controlDefintion.top == 'double')
        classes += " top-space-double";
    if(typeof controlDefintion.bottom != 'undefined' && controlDefintion.bottom == 'single')
        classes += " bottom-space";

    if(typeof controlDefintion.left != 'undefined' && controlDefintion.left == 'single')
        contentHtml = '<div class="left-space-child'+classes+'">' + contentHtml + '</div>';
    else if(typeof controlDefintion.left != 'undefined' && controlDefintion.left == 'double')
        contentHtml = '<div class="left-space-child'+classes+'"><div class="left-space-child">' + contentHtml + '</div></div>';
    else if(typeof controlDefintion.left != 'undefined' && controlDefintion.left == 'triple')
        contentHtml = '<div class="left-space-child'+classes+'"><div class="left-space-child"><div class="left-space-child">' + contentHtml + '</div></div></div>';
    else if(classes.length)
        contentHtml = '<div class="'+ $.trim(classes) + '">' + contentHtml + '</div>';

    return contentHtml;
};