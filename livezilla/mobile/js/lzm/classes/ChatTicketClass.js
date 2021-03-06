/****************************************************************************************
 * LiveZilla ChatTicketClass.js
 *
 * Copyright 2016 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function ChatTicketClass() {
    this.notifyNewTicket = false;
    this.setNotifyNewTicket = false;
    this.updatedTicket = null;
    this.selectedEmailNo = 0;
    this.pausedTicketReplies = [];
    this.CategorySelect = false;
    this.LastActivity = 0;
    this.SearchSettingChangeTimer = null;
    this.logCategories = ['ChangeStatus','ChangeLanguage','ChangeEditor','ChangeGroup','LinkTicket','LinkChat','CreateTicket','DeleteTicket','MoveIntoNewTicket','ForwardMessage','ChangeFullname','ChangeEmail','ChangeCompany','ChangePhone','ChangeSubject','ChangeText','ChangeCustom1','ChangeCustom2','ChangeCustom3','ChangeCustom4','ChangeCustom5','ChangeCustom6','ChangeCustom7','ChangeCustom8','ChangeCustom9','ChangeCustom10','ChangeSubStatus','ChangeSubChannel','ChangePriority','ChangeChannel'];
}

ChatTicketClass.m_TicketChannels = [];
ChatTicketClass.m_BlockReplyDrop = false;
ChatTicketClass.EmailCount = 0;
ChatTicketClass.IsUnreadTicket = false;

ChatTicketClass.prototype.createTicketList = function(tickets, ticketGlobalValues, page, sort, sortDir, query, filter, inDialog, elementId) {
    var that = this;
    lzm_chatDisplay.ticketListTickets = tickets;
    var ticketList = that.createTicketListHtml(tickets, ticketGlobalValues, page, sort, sortDir, query, filter, elementId);
    var ticketListHtml = ticketList[0];
    var numberOfPages = ticketList[1];

    $('#ticket-list').html(ticketListHtml).trigger('create');

    if(this.isFullscreenMode())
        selectTicket(lzm_chatDisplay.selectedTicketRow, true, inDialog, elementId);

    if (page == 1) {
        $('#ticket-page-all-backward').addClass('ui-disabled');
        $('#ticket-page-one-backward').addClass('ui-disabled');
    }
    if (page == numberOfPages) {
        $('#ticket-page-one-forward').addClass('ui-disabled');
        $('#ticket-page-all-forward').addClass('ui-disabled');
    }

    var scols = lzm_displayHelper.getSortableRows('ticket');
    for(var key in scols)
        if(sort != scols[key])
            $('#ticket-sort-' + scols[key].replace(/_/g,'-')+elementId).addClass('inactive-sort-column');

    if (query != '')
    {
        $('#ticket-tree').addClass('ui-disabled');
        $('#ticket-list-tree').addClass('ui-disabled');
    }
    else
    {
        $('#ticket-tree').removeClass('ui-disabled');
        $('#ticket-list-tree').removeClass('ui-disabled');
    }

    UIRenderer.resizeTicketList();
    lzm_chatDisplay.styleTicketClearBtn();

    $('#search-ticket').keyup(function(e) {
        lzm_chatDisplay.searchButtonUp('ticket', tickets, e);
    });
    $('#ticket-create-new').click(function() {
        if (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'create_tickets', {})) {
            showTicketDetails('', false);
        } else {
            showNoPermissionMessage();
        }
    });
    $('#ticket-show-emails').click(function()
    {
        if(ChatTicketClass.EmailCount==0)
            return;
        if (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'review_emails', {}))
            toggleEmailList();
        else
            showNoPermissionMessage();
    });

    $('#ticket-reload-emails').click(function()
    {
        $('#ticket-reload-emails').addClass('ui-disabled');
        setTimeout(function(){
            $('#ticket-reload-emails').removeClass('ui-disabled');
        },10000);
        CommunicationEngine.pollServerSpecial({}, 'reload_emails');
    });

    $('#search-ticket-icon').click(function() {
        if($('#search-ticket').val()!='')
        {
            $('#search-ticket').val('');
            $('#search-ticket').keyup();
        }
        that.UpdateSearchSettings(false);
    });
    $('#search-ticket').keydown(function() {
        lzm_chatDisplay.searchButtonChange('ticket');
    });
    $('#search-ticket').keydown();
    $('#search-ticket').focus(function(){
        that.UpdateSearchSettings(true);
        $('#search-ticket-container').animate({width:'227px'},100);
    });
    $('#search-ticket').blur(function(){
        that.UpdateSearchSettings(true);
        $('#search-ticket-container').animate({width:'127px'});
    });

    $('#ticket-list').click(function(){
        that.LastActivity = lz_global_timestamp();
    });

    $('.ticket_col_header').unbind("contextmenu");
    $('.ticket_col_header').contextmenu(function(){
        var cm = {id: 'ticket_header_cm',entries: [{label: tid('settings'),onClick : 'LocalConfiguration.__OpenTableSettings(\'tickets\')'}]};
        ContextMenuClass.BuildMenu(event,cm);
        return false;
    });

    if (isNaN(numberOfPages))
        switchTicketListPresentation(DataEngine.ticketFetchTime, 0);
};

ChatTicketClass.prototype.UpdateSearchSettings = function(_show){
    $('#ticket-list-search-settings').css({display:(!_show)?'none':'block'});
    var that=this,sshtml='';
    //sshtml += lzm_inputControls.createCheckbox('ticket-ss-schannel', tid('sub_channel'),LocalConfiguration.TicketSearchSettings.split('')[0]=='1','ticket-ss-check');
    //sshtml += lzm_inputControls.createCheckbox('ticket-ss-sstatus', tid('sub_status'),LocalConfiguration.TicketSearchSettings.split('')[1]=='1','ticket-ss-check');

    sshtml += lzm_inputControls.createCheckbox('ticket-ss-hash', tid('hash'),LocalConfiguration.TicketSearchSettings.split('')[2]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-name', tid('fullname'),LocalConfiguration.TicketSearchSettings.split('')[3]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-sid', tid('visitor_id'),LocalConfiguration.TicketSearchSettings.split('')[4]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-tid', tid('ticket_id'),LocalConfiguration.TicketSearchSettings.split('')[5]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-cf', tid('custom_field'),LocalConfiguration.TicketSearchSettings.split('')[6]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-text', tid('text'),LocalConfiguration.TicketSearchSettings.split('')[7]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-email', tid('email'),LocalConfiguration.TicketSearchSettings.split('')[8]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-company', tid('company'),LocalConfiguration.TicketSearchSettings.split('')[9]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-phone', tid('phone'),LocalConfiguration.TicketSearchSettings.split('')[10]=='1','ticket-ss-check');
    sshtml += lzm_inputControls.createCheckbox('ticket-ss-subject', tid('subject'),LocalConfiguration.TicketSearchSettings.split('')[11]=='1','ticket-ss-check');
	sshtml += lzm_inputControls.createCheckbox('ticket-ss-operator', tid('operator'),LocalConfiguration.TicketSearchSettings.split('')[12]=='1','ticket-ss-check');
    $('#ticket-list-search-settings').html(sshtml);

    $('.ticket-ss-check').change(function(){
        LocalConfiguration.TicketSearchSettings = '11';
        //LocalConfiguration.TicketSearchSettings += $('#ticket-ss-schannel').prop('checked') ? '1' : '0';
        //LocalConfiguration.TicketSearchSettings += $('#ticket-ss-sstatus').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-hash').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-name').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-sid').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-tid').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-cf').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-text').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-email').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-company').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-phone').prop('checked') ? '1' : '0';
        LocalConfiguration.TicketSearchSettings += $('#ticket-ss-subject').prop('checked') ? '1' : '0';
		LocalConfiguration.TicketSearchSettings += $('#ticket-ss-operator').prop('checked') ? '1' : '0';
        LocalConfiguration.Save();

        if($('#search-ticket').val()!='')
        {
            if(that.SearchSettingChangeTimer != null)
                clearInterval(that.SearchSettingChangeTimer);

            that.SearchSettingChangeTimer = setTimeout(function(){
                lzm_chatDisplay.searchButtonUp('ticket');
                that.SearchSettingChangeTimer = null;
            },1000);
        }

    });
};

ChatTicketClass.prototype.getTicketById = function(id,returnEmpty){
    returnEmpty = (d(returnEmpty)) ? returnEmpty : false;
    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
        if (lzm_chatDisplay.ticketListTickets[i].id == id)
            return lzm_chatDisplay.ticketListTickets[i];
    for (i in lzm_chatDisplay.ticketControlTickets)
        for (var x=0; x<lzm_chatDisplay.ticketControlTickets[i].length; x++)
            if (lzm_chatDisplay.ticketControlTickets[i][x].id == id)
                return lzm_chatDisplay.ticketControlTickets[i][x];
    if(returnEmpty)
        return {};
    return null;
};

ChatTicketClass.prototype.getTicketIndexById = function(id){
    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
        if (lzm_chatDisplay.ticketListTickets[i].id == id)
            return i;
    return 0;
};

ChatTicketClass.prototype.updateTicketList = function(tickets, ticketGlobalValues, page, sort, sortDir, query, filter, forceRecreate, pollObject) {
    var selectedTicketExistsInList = false, that = this;
    ChatTicketClass.IsUnreadTicket = false;
    for (var i=0; i<tickets.length; i++)
        if (tickets[i].id == lzm_chatDisplay.selectedTicketRow || lzm_chatDisplay.selectedTicketRow == '')
            selectedTicketExistsInList = true;

    if (!selectedTicketExistsInList)
        try
        {
            lzm_chatDisplay.selectedTicketRow = (tickets.length > lzm_chatDisplay.selectedTicketRowNo) ?
                tickets[lzm_chatDisplay.selectedTicketRowNo].id : tickets[tickets.length - 1].id;
        }
        catch(ex)
        {

        }

    pollObject = (typeof pollObject != 'undefined') ? pollObject : null;
    forceRecreate = (typeof forceRecreate != 'undefined') ? forceRecreate : false;
    forceRecreate = (forceRecreate || lzm_chatDisplay.ticketGlobalValues.updating != ticketGlobalValues.updating);

    var ticketDutHasChanged = (lzm_chatDisplay.ticketGlobalValues['dut'] != ticketGlobalValues['dut']);
    var customDemandToken = (pollObject != null && pollObject.p_cdt != 0) ? pollObject.p_cdt : false;
    var notificationSound = '';

    if(customDemandToken && customDemandToken != 'linker')
        lzm_chatDisplay.ticketControlTickets[customDemandToken] = lzm_commonTools.clone(tickets);

    // email = 3
    if (!isNaN(parseInt(ticketGlobalValues.elmc)) && (!isNaN(parseInt(lzm_chatDisplay.ticketGlobalValues.elmc)) && parseInt(ticketGlobalValues.elmc) > parseInt(lzm_chatDisplay.ticketGlobalValues.elmc)))
    {
        if(lzm_chatDisplay.selected_view!='tickets')
            this.notifyNewTicket = true;

        if(this.LastActivity < (lz_global_timestamp()-15))
        {
            var notificationPushText = (ticketGlobalValues.elmn != '') ? tid('notification_new_message',[['<!--sender-->', ticketGlobalValues.elmn], ['<!--text-->', ticketGlobalValues.elmt]]) : t('New Message');

            if (LocalConfiguration.PlayTicketSound)
                lzm_chatDisplay.playSound('ticket', 'tickets');

            if(LocalConfiguration.NotificationEmails)
            {
                IFManager.IFShowNotification(t('LiveZilla'), notificationPushText, notificationSound, '', '', '3');
                if(!IFManager.IsDesktopApp())
                    if (lzm_chatDisplay.selected_view != 'tickets')
                        lzm_displayHelper.showBrowserNotification({text: ticketGlobalValues.elmt,sender: ticketGlobalValues.elmn,subject: t('New Message'),action: 'SelectView(\'tickets\'); closeOrMinimizeDialog();',timeout: 10,icon: 'fa-envelope-o'});
            }
        }
    }

    // ticket = 2
    if (!isNaN(parseInt(ticketGlobalValues.tlmc)) && (!isNaN(parseInt(lzm_chatDisplay.ticketGlobalValues.tlmc)) && parseInt(ticketGlobalValues.tlmc) > parseInt(lzm_chatDisplay.ticketGlobalValues.tlmc)))
    {
        if(lzm_chatDisplay.selected_view!='tickets')
            this.notifyNewTicket = true;

        if(this.LastActivity < (lz_global_timestamp()-15))
        {
            notificationPushText = (ticketGlobalValues.tlmn != '') ? tid('notification_new_message',[['<!--sender-->', ticketGlobalValues.tlmn], ['<!--text-->', ticketGlobalValues.tlmt]]) : t('New Message');

            if (LocalConfiguration.PlayTicketSound)
                lzm_chatDisplay.playSound('ticket', 'tickets');

            if(LocalConfiguration.NotificationTickets)
            {
                notificationSound = (LocalConfiguration.PlayTicketSound) ? 'NONE' : 'DEFAULT';
                IFManager.IFShowNotification(t('LiveZilla'), notificationPushText, notificationSound, '', '', '2');
                if(!IFManager.IsDesktopApp())
                    if (lzm_chatDisplay.selected_view != 'tickets')
                    {
                        lzm_displayHelper.showBrowserNotification({text: ticketGlobalValues.tlmt,sender: ticketGlobalValues.tlmn,subject: t('New Message'),action: 'SelectView(\'tickets\'); closeOrMinimizeDialog();',timeout: 10,icon: 'fa-envelope'});
                    }
            }
        }
    }

    try
    {
        lzm_chatDisplay.ticketGlobalValues = lzm_chatDisplay.lzm_commonTools.clone(ticketGlobalValues);
        var selectedTicket = {id: ''};
        for (var j=0; j<tickets.length; j++) {
            var ticketEditor = (typeof tickets[j].editor != 'undefined' && tickets[j].editor != false) ? tickets[j].editor.ed : '';
            if (lzm_commonTools.checkTicketReadStatus(tickets[j].id, lzm_chatDisplay.ticketReadArray, tickets) == -1 &&
                (!lzm_chatDisplay.ticketReadStatusChecked || ticketEditor == lzm_chatDisplay.myId || ticketEditor == '')) {
                lzm_chatDisplay.ticketReadArray = lzm_commonTools.removeTicketFromReadStatusArray(tickets[j].id, lzm_chatDisplay.ticketReadArray, true);
            }
            if (lzm_chatDisplay.ticketReadStatusChecked && ticketEditor != lzm_chatDisplay.myId && ticketEditor != '' && tickets[j].u > lzm_chatDisplay.ticketGlobalValues.mr) {
                lzm_chatDisplay.ticketReadArray = lzm_commonTools.addTicketToReadStatusArray(tickets[j].id, lzm_chatDisplay.ticketReadArray, tickets);
            }
            if (tickets[j].id == lzm_chatDisplay.selectedTicketRow) {
                for (var k=0; k<lzm_chatDisplay.ticketListTickets.length; k++) {
                    if (tickets[j].id == lzm_chatDisplay.ticketListTickets[k].id && tickets[j].md5 != lzm_chatDisplay.ticketListTickets[k].md5) {
                        selectedTicket = tickets[j];
                    }
                }
            }
        }

        if(!customDemandToken)
            lzm_chatDisplay.ticketListTickets  = tickets;

        var numberOfUnreadTickets = lzm_chatDisplay.ticketGlobalValues.r - lzm_chatDisplay.ticketReadArray.length + lzm_chatDisplay.ticketUnreadArray.length;
        numberOfUnreadTickets = (typeof numberOfUnreadTickets == 'number' && numberOfUnreadTickets >= 0) ? numberOfUnreadTickets : 0;

        if (!customDemandToken && lzm_chatDisplay.ticketGlobalValues.u != numberOfUnreadTickets)
            lzm_chatDisplay.ticketGlobalValues.u = numberOfUnreadTickets;

        ChatTicketClass.EmailCount = lzm_chatDisplay.ticketGlobalValues['e'];

        $('#ticket-show-emails').children('span').html(t('Emails <!--number_of_emails-->',[['<!--number_of_emails-->', '(' + ChatTicketClass.EmailCount + ')']]));

        if (ChatTicketClass.EmailCount > 0)
        {
            $('#ticket-show-emails').addClass('lzm-button-b-active');
            $('#ticket-reload-emails').addClass('lzm-button-b-active');
        }
        else
        {
            $('#ticket-show-emails').removeClass('lzm-button-b-active');
            $('#ticket-reload-emails').removeClass('lzm-button-b-active');
        }

        if (!customDemandToken)
        {
            if (lzm_chatDisplay.selected_view == 'tickets')
                if (ticketDutHasChanged || forceRecreate)
                    that.createTicketList(lzm_chatDisplay.ticketListTickets, ticketGlobalValues, page, sort, sortDir, query, filter, false, '');

            if (numberOfUnreadTickets == 0 && lzm_chatDisplay.numberOfUnreadTickets != 0 && lzm_chatDisplay.ticketReadArray.length > 0)
                setAllTicketsRead();

            lzm_chatDisplay.numberOfUnreadTickets = numberOfUnreadTickets;

            if ($('#reply-placeholder').length > 0) {
                that.showOtherOpEditWarning(selectedTicket);
            }
            if(($('#ticket-details-placeholder').length == 1) && ($('#ticket-history-div').length == 1) && selectedTicket.id != '') {
                that.updateTicketDetails(selectedTicket);
            }
        }
        else if(customDemandToken && customDemandToken != 'linker')
        {
            if ($('#visitor-info-d-'+customDemandToken+'-placeholder').length > 0) {
                var numberOfTickets = tickets.length;
                $('#matching-tickets-d-'+customDemandToken+'-table').html(that.CreateMatchingTicketsTableContent(tickets, 'd-'+customDemandToken));
                $('#visitor-info-d-'+customDemandToken+'-placeholder-tab-6').html(t('Tickets (<!--number_of_tickets-->)', [['<!--number_of_tickets-->', numberOfTickets]]));
                if(numberOfTickets>0){
                    $('#visitor-info-d-'+customDemandToken+'-placeholder-tab-6').removeClass('ui-disabled');
                    $('#visitor-info-d-'+customDemandToken+'-placeholder-tab-6').addClass('lzm-tabs-message');
                }
                selectTicket('',true,true,'d-'+customDemandToken);
            }
            if ($('#visitor-info-e-'+customDemandToken+'-placeholder').length > 0) {
                var numberOfTickets = tickets.length;
                $('#matching-tickets-e-'+customDemandToken+'-table').html(that.CreateMatchingTicketsTableContent(tickets, 'e-'+customDemandToken));
                $('#visitor-info-e-'+customDemandToken+'-placeholder-tab-6').html(t('Tickets (<!--number_of_tickets-->)', [['<!--number_of_tickets-->', numberOfTickets]]));
                if(numberOfTickets>0){
                    $('#visitor-info-e-'+customDemandToken+'-placeholder-tab-6').removeClass('ui-disabled');
                    $('#visitor-info-e-'+customDemandToken+'-placeholder-tab-6').addClass('lzm-tabs-message');
                }
                selectTicket('',true,true,'e-'+customDemandToken);
            }
        }

        if (customDemandToken && customDemandToken != 'linker' && $('#ticket-linker-first').length > 0) {

            var position = $('#ticket-linker-first').data('search').split('~')[0];
            var linkerType = $('#ticket-linker-first').data('search').split('~')[1];
            var inputChangeId = $('#ticket-linker-first').data('input');
            if (linkerType == 'ticket')
            {
                that.fillLinkData(position, $('#' + inputChangeId).val(), false, true);
            }
        }
    } catch(e) {deblog(e);}
};

ChatTicketClass.prototype.showOtherOpEditWarning = function(selectedTicket) {
    if (selectedTicket.id != '') {

        if (typeof selectedTicket.editor != 'undefined' && typeof selectedTicket.editor.ed != 'undefined' && selectedTicket.editor.ed != lzm_chatDisplay.myId)
        {
            var otherOp = DataEngine.operators.getOperator(selectedTicket.editor.ed);
            if(otherOp == null)
                return;

            var opName = (otherOp != null) ? otherOp.name : t('another operator');
            var warningMsg = tid('ticket_processed_other_op', [['<!--op_name-->', opName]]);
            lzm_commonDialog.createAlertDialog(warningMsg, [{id: 'ok', name: t('Ok')}]);
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
            });
        }
    }
};

ChatTicketClass.prototype.createTicketListHtml = function(tickets, ticketGlobalValues, page, sort, sortDir, query, filter, elementId) {

    var ww=$(window).width(),fullScreenMode = this.isFullscreenMode(), that = this, i;
    var totalTickets = ticketGlobalValues.t;
    var unreadTickets = Math.max(0, ticketGlobalValues.r - lzm_chatDisplay.ticketReadArray.length + lzm_chatDisplay.ticketUnreadArray.length);
    lzm_chatDisplay.ticketGlobalValues.u = unreadTickets;

    var filteredTickets = ticketGlobalValues.q;
    ChatTicketClass.EmailCount = ticketGlobalValues.e;

    var ticketListInfo1 = t('<!--total_tickets--> total entries, <!--unread_tickets--> new entries, <!--filtered_tickets--> matching filter', [['<!--total_tickets-->', totalTickets], ['<!--unread_tickets-->', unreadTickets], ['<!--filtered_tickets-->', filteredTickets]]);
    var ticketListInfo2 = t('<!--total_tickets--> total entries, <!--unread_tickets--> new entries', [['<!--total_tickets-->', totalTickets], ['<!--unread_tickets-->', unreadTickets]]);
    var ticketListHtml = '<div id="ticket-list-headline" class="lzm-dialog-headline"><h3>' + t('Tickets') + '</h3></div><div id="ticket-list-headline2" class="lzm-dialog-headline2">';

    ticketListHtml += '<span class="left-button-list">'
        + lzm_inputControls.createButton('ticket-tree', '', 'handleTicketTree();','', '<i class="fa fa-list-ul"></i>', 'lr',{'margin-left': '4px','margin-right': '0px'}, '', 10)
        + lzm_inputControls.createButton('ticket-filter', '', 'setTicketFilter();','', '<i class="fa fa-filter"></i>', 'lr',{'margin-left': '4px','margin-right': '0px'}, '', 10)
        + '</span>';

    if ($(window).width() > 800) {
        var ticketListInfo = (CommunicationEngine.ticketFilterStatus.length == 4 && CommunicationEngine.ticketQuery == '') ? ticketListInfo2 : ticketListInfo1;
        ticketListHtml += '<span class="lzm-dialog-hl2-info">' + ticketListInfo + '</span>';
    }

    ticketListHtml += '<span class="right-button-list" style="margin-right:129px;">' +
        lzm_inputControls.createInput('search-ticket','', query, t('Search'), '<i class="fa fa-remove"></i>', 'text', 'b') + '</div>';


    var ticketListBodyCss = ((IFManager.IsAppFrame || IFManager.IsMobileOS) || ww <= 1000) ? ' style="overflow: auto;"' : '';
    ticketListHtml += '<div id="ticket-list-body" class="lzm-dialog-body" onclick="removeTicketContextMenu();"' + ticketListBodyCss + '>';
    ticketListHtml += this.getTicketTreeViewHtml(ticketGlobalValues);
    ticketListHtml += '<div id="ticket-list-left" class="ticket-list">';
    ticketListHtml += '<table class="visible-list-table alternating-rows-table lzm-unselectable"><thead><tr onclick="removeTicketContextMenu();">';

    if(fullScreenMode)
    {
        ticketListHtml += '<th>&nbsp;</th><th>&nbsp;</th><th>&nbsp;</th>';
        for (i=0; i<LocalConfiguration.TableColumns.ticket.length; i++)
        {
            var thisTicketColumn = LocalConfiguration.TableColumns.ticket[i];
            if (thisTicketColumn.display == 1)
            {
                var cellId = (typeof thisTicketColumn.cell_id != 'undefined') ? ' id="' + thisTicketColumn.cell_id + elementId + '"' : '';
                var cellClass = (typeof thisTicketColumn.cell_class != 'undefined') ? ' ' + thisTicketColumn.cell_class : '';
                var cellStyle = (typeof thisTicketColumn.cell_style != 'undefined') ? ' style="position: relative; white-space: nowrap; ' + thisTicketColumn.cell_style + '"' : ' style="position: relative; white-space: nowrap;"';
                var cellOnclick = (typeof thisTicketColumn.cell_onclick != 'undefined') ? ' onclick="' + thisTicketColumn.cell_onclick + '"' : '';
                var arrowType = (d(thisTicketColumn.sort_invert)) ? ((sortDir!='ASC')?'up':'down') : ((sortDir=='ASC')?'up':'down');
                var cellIcon = (d(thisTicketColumn.cell_class) && thisTicketColumn.cell_class == 'ticket-list-sort-column') ? '<span style="position: absolute; right: 4px;"><i class="fa fa-caret-'+arrowType+'"></i></span>' : '';
                var cellRightPadding = (typeof thisTicketColumn.cell_class != 'undefined' && thisTicketColumn.cell_class == 'ticket-list-sort-column') ? ' style="padding-right: 25px;"' : '';
                ticketListHtml += '<th' + cellId + cellStyle + cellOnclick + ' class="ticket_col_header'+cellClass+'"><span' + cellRightPadding + '>' + t(thisTicketColumn.title) + '</span>' + cellIcon + '</th>';
            }
        }
    }

    ticketListHtml += '</tr></thead><tbody>';
    var lineCounter = 0;
    var numberOfTickets = (typeof ticketGlobalValues.q != 'undefined') ? ticketGlobalValues.q : ticketGlobalValues.t;
    var numberOfPages = Math.max(1, Math.ceil(numberOfTickets / ticketGlobalValues.p));
    if (ticketGlobalValues.updating)
        ticketListHtml += '<tr><td colspan="15" style="font-weight: bold; font-size: 16px; text-align: center; padding: 20px;">' + t('The ticket database is updating.') +'</td></tr>';
    else if (!isNaN(numberOfPages))
        for (i=0; i<tickets.length; i++)
            if (tickets[i].del == 0)
            {
                ticketListHtml += that.createTicketListLine(tickets[i], lineCounter, false, elementId, fullScreenMode);
                lineCounter++;
            }

    ticketListHtml += '</tbody></table></div>';
    ticketListHtml += '<div id="ticket-list-right" class="ticket-list"></div>';
    ticketListHtml += '<div id="ticket-list-actions" class="ticket-list"><span style="float:left;">';
    ticketListHtml += lzm_inputControls.createButton('ticket-action-reply', 'ui-disabled ticket-action', 'showTicketDetails();$(\'#reply-ticket-details\').click();', tid('ticket_reply'), '<i class="fa fa-mail-reply"></i>', 'r',{'margin-left':'6px'});
    ticketListHtml += lzm_inputControls.createButton('ticket-action-open', 'ui-disabled ticket-action', 'showTicketDetails();', tid('open_ticket'), '', 'r',{'margin-left':'4px'});
    ticketListHtml += lzm_inputControls.createButton('ticket-action-comment', 'ui-disabled ticket-action', 'addComment();', tid('comment'), '', 'r',{'margin-left':'4px'});
    ticketListHtml += '</span><span style="float:right;">';
    ticketListHtml += lzm_inputControls.createButton('ticket-action-translate', 'ui-disabled ticket-action', 'showTicketMsgTranslator();', tid('translate'), '', 'r',{'margin-right':'6px'});
    ticketListHtml += '</span></div>';
    ticketListHtml += '</div><div id="ticket-list-footline" class="lzm-dialog-footline">';

    if (!isNaN(numberOfPages)) {
        ticketListHtml += lzm_inputControls.createButton('ticket-page-all-backward', 'ticket-list-page-button', 'pageTicketList(1);', '', '<i class="fa fa-fast-backward"></i>', 'l',
            {'border-right-width': '1px'}) +
            lzm_inputControls.createButton('ticket-page-one-backward', 'ticket-list-page-button', 'pageTicketList(' + (page - 1) + ');', '', '<i class="fa fa-backward"></i>', 'r',
                {'border-left-width': '1px'}) +
            '<span style="padding: 0 15px;">' + t('Page <!--this_page--> of <!--total_pages-->',[['<!--this_page-->', page], ['<!--total_pages-->', numberOfPages]]) + '</span>' +
            lzm_inputControls.createButton('ticket-page-one-forward', 'ticket-list-page-button', 'pageTicketList(' + (page + 1) + ');', '', '<i class="fa fa-forward"></i>', 'l',{'border-right-width': '1px'}) +
            lzm_inputControls.createButton('ticket-page-all-forward', 'ticket-list-page-button', 'pageTicketList(' + numberOfPages + ');', '', '<i class="fa fa-fast-forward"></i>', 'r',{'border-left-width': '1px'});
    }
    ticketListHtml += '</div><div id="ticket-list-search-settings"></div>';
    return [ticketListHtml, numberOfPages];
};

ChatTicketClass.prototype.getTicketTreeViewHtml = function(_amounts){

    var curSelCat = lzm_commonStorage.loadValue('show_ticket_cat_' + DataEngine.myId);

    function getSelClass(_id){
        return (_id == curSelCat || curSelCat == null && _id == 'tnFilterStatusActive') ? ' class="selected-treeview-div"' : '';
    }
    function getSubStatuses(_parentNumber, _parentId){
        var key,elemHtml ="";
        if(d(DataEngine.global_configuration.database))
            for(key in DataEngine.global_configuration.database['tsd'])
            {
                var elem = DataEngine.global_configuration.database['tsd'][key];
                {
                    var oncevs = ' onclick="handleTicketTreeClickEvent(this.id,\''+_parentId+'\',\''+elem.name+'\');"';
                    if(_parentNumber == elem.parent && elem.type == 0)
                        elemHtml += '<div id="'+elem.sid+'" style="padding-left:'+paddings[3]+';"'+getSelClass(elem.sid)+oncevs+'><i class="fa fa-caret-right icon-light"></i>'+elem.name+' ('+_amounts['ttsd' + elem.sid]+')</div>';
                }
            }
        return elemHtml;
    }

    var paddings =['5px','20px','35px','50px'],cactive = parseInt(_amounts['ttst0'])+parseInt(_amounts['ttst1']);
    var oncev = ' onclick="handleTicketTreeClickEvent(this.id,null);"';
    var treeHtml = '<div id="ticket-list-tree" class="ticket-list">';

    treeHtml += '<div id="ttv_tn_all" style="padding-left:'+paddings[0]+';"'+getSelClass('ttv_tn_all')+oncev+'><i class="fa fa-caret-down icon-light"></i>'+tid('all_tickets')+' ('+_amounts['ta']+')</div>';
    treeHtml += '<div id="tnFilterStatusActive" style="padding-left:'+paddings[1]+';"'+getSelClass('tnFilterStatusActive')+oncev+'><i class="fa fa-caret-down icon-light"></i><b>'+tid('active')+' ('+cactive+')</b></div>';
    treeHtml += '<div id="tnFilterStatusOpen" style="padding-left:'+paddings[2]+';"'+getSelClass('tnFilterStatusOpen')+oncev+'><i class="fa fa-question-circle" style="color: #5197ff;"></i>'+tid('ticket_status_0')+' ('+_amounts['ttst0']+')</div>';
    treeHtml += getSubStatuses('0','tnFilterStatusOpen');
    treeHtml += '<div id="tnFilterStatusInProgress" style="padding-left:'+paddings[2]+';"'+getSelClass('tnFilterStatusInProgress')+oncev+'><i class="fa fa-gear" style="color: #808080;"></i>'+tid('ticket_status_1')+' ('+_amounts['ttst1']+')</div>';
    treeHtml += getSubStatuses('1','tnFilterStatusInProgress');
    treeHtml += '<div id="tnFilterStatusClosed" style="padding-left:'+paddings[2]+';"'+getSelClass('tnFilterStatusClosed')+oncev+'><i class="fa fa-check-circle icon-green"></i>'+tid('ticket_status_2')+' ('+_amounts['ttst2']+')</div>';
    treeHtml += getSubStatuses('2','tnFilterStatusClosed');
    treeHtml += '<div id="tnFilterStatusDeleted" style="padding-left:'+paddings[2]+';"'+getSelClass('tnFilterStatusDeleted')+oncev+'><i class="fa fa-remove icon-red"></i>'+tid('ticket_status_3')+' ('+_amounts['ttst3']+')</div>';
    treeHtml += getSubStatuses('3','tnFilterStatusDeleted');
    treeHtml += '<div style="padding-left:'+paddings[0]+';cursor:default;"><i class="fa fa-caret-down icon-light"></i>'+tid('my_tickets')+'</div>';
    treeHtml += '<div id="tnFilterMyTickets" style="padding-left:'+paddings[1]+';"'+getSelClass('tnFilterMyTickets')+oncev+'><i class="fa fa-caret-right icon-light"></i>'+tid('my_active_tickets')+' ('+_amounts['ttm']+')</div>';
    treeHtml += '<div id="tnFilterMyGroupsTickets" style="padding-left:'+paddings[1]+';"'+getSelClass('tnFilterMyGroupsTickets')+oncev+'><i class="fa fa-caret-right icon-light"></i>'+tid('my_groups_active_tickets')+' ('+_amounts['ttmg']+')</div>';
    treeHtml += '<div id="tnFilterWatchList" style="padding-left:'+paddings[1]+';"'+getSelClass('tnFilterWatchList')+oncev+'><i class="fa fa-binoculars"></i>'+tid('watch_list')+' ('+DataEngine.ticketWatchList.length+')</div>';
    treeHtml += '<div class="ticket-button-panel">';

    if(curSelCat == 'tnFilterStatusActive' && ChatTicketClass.__ProcessNext(true) > 0)
    {
        treeHtml += lzm_inputControls.createButton('process-next-btn', '', 'ChatTicketClass.__ProcessNext(false);', tid('next_ticket'), '<i class="fa fa-play-circle"></i>', 'force-text',{'width':'195px','margin-bottom':0},'',30,'d');
    }

    var emailDisabledClass = (ChatTicketClass.EmailCount > 0) ? 'lzm-button-b-active' : '';
    treeHtml += lzm_inputControls.createButton('ticket-show-emails', emailDisabledClass, '', t('Emails <!--number_of_emails-->',[['<!--number_of_emails-->', '(' + ChatTicketClass.EmailCount + ')']]), '<i class="fa fa-envelope-o"></i>', 'force-text',{'width':'161px','border-radius':'2px 0 0 2px'}, '', 30,'b');
    treeHtml += lzm_inputControls.createButton('ticket-reload-emails', emailDisabledClass, '', '&nbsp;', '<i class="fa fa-refresh"></i>', 'force-text',{'width':'15px','padding-left':'12px','border-radius':'0 2px 2px 0','margin-left':'-1px'}, '', 30,'b');
    treeHtml += lzm_inputControls.createButton('ticket-create-new', '', '', t('Create Ticket'), '<i class="fa fa-plus"></i>', 'force-text', {'width':'195px','margin-top':0}, '', 30, 'b') + '</span>';

    return treeHtml + '</div></div>';
};

ChatTicketClass.prototype.createTicketListLine = function(ticket, lineCounter, inDialog, elementId, fullScreenMode) {
    var that = this, userStyle,i;
    ticket.messages.sort(that.ticketMessageSortfunction);
    userStyle = ' style="cursor: pointer;"';

    var ticketDateObject = lzm_chatTimeStamp.getLocalTimeObject(ticket.messages[0].ct * 1000, true);
    var ticketDateHuman = lzm_commonTools.getHumanDate(ticketDateObject, '', lzm_chatDisplay.userLanguage);
    var ticketLastUpdatedHuman = '-';
    if (ticket.u != 0) {
        var ticketLastUpdatedObject = lzm_chatTimeStamp.getLocalTimeObject(ticket.u * 1000, true);
        ticketLastUpdatedHuman = lzm_commonTools.getHumanDate(ticketLastUpdatedObject, '', lzm_chatDisplay.userLanguage);
    }
    var waitingTime = lzm_chatTimeStamp.getServerTimeString(null, true) - ticket.w;
    var waitingTimeHuman = '-';

    if (waitingTime < 0)waitingTimeHuman = '-';
    else if (waitingTime > 0 && waitingTime <= 3600)waitingTimeHuman = t('<!--time_amount--> minutes', [['<!--time_amount-->', Math.max(1, Math.floor(waitingTime / 60))]]);
    else if (waitingTime > 3600 && waitingTime <= 86400)waitingTimeHuman = t('<!--time_amount--> hours', [['<!--time_amount-->', Math.floor(waitingTime / 3600)]]);
    else if (waitingTime > 86400)waitingTimeHuman = t('<!--time_amount--> days', [['<!--time_amount-->', Math.floor(waitingTime / 86400)]]);

    var operator = '';
    var groupId = (typeof ticket.editor != 'undefined' && ticket.editor != false) ? ticket.editor.g : ticket.gr;
    var myGroup = DataEngine.groups.getGroup(groupId);
    var group = (myGroup != null) ? myGroup.name : groupId;

    if (typeof ticket.editor != 'undefined' && ticket.editor != false)
        operator = (DataEngine.operators.getOperator(ticket.editor.ed) != null) ? DataEngine.operators.getOperator(ticket.editor.ed).name : '';

    var callBack = (ticket.messages[0].cmb == 1) ? t('Yes') : t('No');
    var ticketReadFontWeight = ' font-weight: bold;';
    var ticketReadImage = '<i class="fa fa-envelope"></i>';

    if ((ticket.u <= lzm_chatDisplay.ticketGlobalValues.mr && lzm_commonTools.checkTicketReadStatus(ticket.id, lzm_chatDisplay.ticketUnreadArray) == -1) || lzm_commonTools.checkTicketReadStatus(ticket.id, lzm_chatDisplay.ticketReadArray, lzm_chatDisplay.ticketListTickets) != -1)
    {
        ticketReadImage = '<i class="fa fa-envelope-o"></i>';
        ticketReadFontWeight = '';
    }
    else
    {
        ChatTicketClass.IsUnreadTicket = true;
    }

    if (ticket.t == 6)
        ticketReadImage = '<i class="fa fa-facebook"></i>';
    else if (ticket.t == 7)
        ticketReadImage = '<i class="fa fa-twitter"></i>';

    var ticketStatusImage = '<i class="fa fa-question-circle" style="color: #5197ff;"></i>';
    var statusText = tid('ticket_status_0'), subStatusText = '';
    if (typeof ticket.editor != 'undefined' && ticket.editor != false) {
        subStatusText = ticket.editor.ss;
        if (ticket.editor.st == 1)
        {
            ticketStatusImage = '<i class="fa fa-gear" style="color: #808080;"></i>';
            statusText = tid('ticket_status_1');
        }
        else if (ticket.editor.st == 2){
            ticketStatusImage = '<i class="fa fa-check-circle icon-green"></i>';
            statusText = tid('ticket_status_2');
        }
        else if (ticket.editor.st == 3){
            ticketStatusImage = '<i class="fa fa-remove icon-red"></i>';
            statusText = tid('ticket_status_3');
        }

    }
    var onclickAction = '', ondblclickAction = '', oncontextmenuAction = '';
    if (!fullScreenMode)
        onclickAction = ' onclick="selectTicket(\'' + ticket.id + '\');setTimeout(function(){showTicketDetails(\'' + ticket.id + '\', false, \'\', \'\', \'' + dialogId + '\');},100);"';
    else
    {
        var dialogId = (!inDialog || !$('#visitor-information').length) ? '' : $('#visitor-information').data('dialog-id');
        if(IFManager.IsMobileOS)
        {
            onclickAction = ' onclick="selectTicket(\'' + ticket.id + '\', false, ' + inDialog + ', \''+elementId+'\',this,event);openTicketContextMenu(event, \'' + ticket.id + '\', ' + inDialog + ', \''+elementId+'\',this); return false;"';
        }
        else
        {
            onclickAction = ' onclick="selectTicket(\'' + ticket.id + '\', false, ' + inDialog + ', \''+elementId+'\',this,event);"';
            oncontextmenuAction = ' oncontextmenu="openTicketContextMenu(event, \'' + ticket.id + '\', ' + inDialog + ', \''+elementId+'\',this); return false;"';
            ondblclickAction = ' ondblclick="showTicketDetails(\'' + ticket.id + '\', false, \'\', \'\', \'' + dialogId + '\');"';
        }
    }

    var dueTimeFull = DataEngine.getConfigValue('gl_tidt',false)*3600;
    var dueTimeHalf = DataEngine.getConfigValue('gl_tidt',false)*2700;

    function getPriorityClass(_p){
        return['','','',' text-orange text-bold',' text-red text-bold'][_p];
    }
    function getWaitingTimeClass(_wt) {
        if(_wt > -1 &&_wt > dueTimeFull)
            return ' bg-red';
        else if(_wt > -1 &&_wt > dueTimeHalf)
            return ' bg-orange';
        return'';
    }
    function getWaitingTimeTextClass(_wt) {
        if(_wt > -1 &&_wt > dueTimeFull)
            return ' text-red text-bold';
        else if(_wt > -1 &&_wt > dueTimeHalf)
            return ' text-orange text-bold';
        return'';
    }

    var thisTicketSubject = (ticket.messages[0].s.length < 80) ? ticket.messages[0].s : ticket.messages[0].s.substr(0, 77) + '...';
    var columnContents = [{cid: 'last_update', contents: ticketLastUpdatedHuman},
        {cid: 'date', contents: ticketDateHuman},
        {cid: 'waiting_time', class: ' text-center' + getWaitingTimeTextClass(waitingTime), contents: waitingTimeHuman},
        {cid: 'ticket_id', contents: ticket.id},
        {cid: 'subject', contents: lzm_commonTools.htmlEntities(thisTicketSubject)},
        {cid: 'operator', contents: operator},
        {cid: 'name', contents: lzm_commonTools.htmlEntities(ticket.messages[0].fn)},
        {cid: 'email', contents: lzm_commonTools.htmlEntities(ticket.messages[0].em)},
        {cid: 'company', contents: lzm_commonTools.htmlEntities(ticket.messages[0].co)},
        {cid: 'group', contents: group}, {cid: 'phone', contents: lzm_commonTools.htmlEntities(ticket.messages[0].p)},
        {cid: 'hash', contents: ticket.h}, {cid: 'callback', contents: callBack},
        {cid: 'status', contents: statusText},
        {cid: 'sub_status', contents: subStatusText},
        {cid: 'channel_type', contents: ChatTicketClass.m_TicketChannels[ticket.t].title},
        {cid: 'sub_channel', contents: ticket.s},
        {cid: 'messages', contents: ticket.messages.length},
        {cid: 'ip_address', contents: ticket.messages[0].ip},
        {cid: 'priority', class: ' text-center' + getPriorityClass(ticket.p), contents: tid('priority_' + ticket.p.toString())}

    ];

    LocalConfiguration.AddCustomBlock(columnContents);

    var tblCellStyle = ' style="' + ticketReadFontWeight + '"';
    var ticketLineId = (!inDialog) ? 'ticket-list-row-' + ticket.id : 'matching-ticket-list-'+elementId+'-row-' + ticket.id;
    var addClass = '';
    var lineHtml = '<tr data-line-number="' + lineCounter + '" class="ticket-list-row ticket-list-row-' + lineCounter + ' lzm-unselectable' +
        '" id="' + ticketLineId + '"' + userStyle + onclickAction + ondblclickAction + oncontextmenuAction + '>' +
        '<td' + tblCellStyle.replace(/"$/,'text-align: center;"') + ' class="icon-column" nowrap>' + ticketStatusImage + '</td>' +
        '<td' + tblCellStyle.replace(/"$/,'text-align: center;"') + ' class="icon-column" nowrap>' + ticketReadImage + '</td>' +
        '<td' + tblCellStyle.replace(/"$/,'text-align: center;"') + ' class="icon-column" nowrap>' + this.getDirectionImage(true,ticket.messages[ticket.messages.length-1],'') + '</td>';

    var searchFor = $('#search-ticket').val();

    if(fullScreenMode)
    {
        for (i=0; i<LocalConfiguration.TableColumns.ticket.length; i++)
            for (var j=0; j<columnContents.length; j++)
                if (LocalConfiguration.TableColumns.ticket[i].cid == columnContents[j].cid && LocalConfiguration.TableColumns.ticket[i].display == 1)
                {
                    addClass = (lzm_displayHelper.matchSearch(searchFor,columnContents[j].contents)) ? 'search-match' : '';

                    if(d(columnContents[j].class))
                        addClass += columnContents[j].class;

                    addClass += getWaitingTimeClass(waitingTime);
                    columnContents[j].contents = (columnContents[j].contents != '') ? columnContents[j].contents : '-';

                    if(LocalConfiguration.IsCustom(columnContents[j].cid))
                    {
                        var cindex = parseInt(columnContents[j].cid.replace('c',''));
                        var myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[cindex]);
                        var inputText = '';
                        var customValue = lzm_commonTools.GetElementByProperty(ticket.messages[0].customInput,'id',myCustomInput.name);
                        if(customValue.length)
                        {
                            inputText = (myCustomInput.type != 'CheckBox') ? lzm_commonTools.htmlEntities(customValue[0].text) : (customValue[0].text == 1) ? t('Yes') : t('No');
                            inputText = (inputText != '') ? inputText : '-';
                            addClass = (lzm_displayHelper.matchSearch(searchFor,inputText)) ? 'search-match' : getWaitingTimeClass(waitingTime);
                        }
                        else
                            inputText = '-';


                        lineHtml += '<td class="' + lz_global_trim(addClass) + '">' + inputText + '</td>';
                    }
                    else
                        lineHtml += '<td' + tblCellStyle + ' class="' + lz_global_trim(addClass) + '">' + columnContents[j].contents + '</td>';

                }

    }
    else
    {
        var svContent = '<b>' + lzm_commonTools.htmlEntities(ticket.messages[0].fn) + '</b>';
        svContent += '<div>' + lzm_commonTools.htmlEntities(ticket.messages[0].s) + '</div>';
        svContent += '<div class="lzm-info-text">' + lzm_commonTools.htmlEntities(lzm_commonTools.SubStr(ticket.messages[ticket.messages.length-1].mt,200,true)) + '</div>';
        svContent = svContent.replace(/\n/g, " ").replace(/\r/g, " ").replace(/<br>/g, " ");
        lineHtml += '<td' + tblCellStyle + ' class="' + lz_global_trim(addClass) + ' ticket-simple-cell">' + svContent + '</td>';
    }

    return lineHtml + '</tr>';
};

ChatTicketClass.prototype.createMatchingTickets = function(_ticketList,elementId) {
    elementId = (typeof elementId != 'undefined') ? elementId : '';
    return '<div data-role="none" id="matching-tickets-'+elementId+'-inner"><table id="matching-tickets-'+elementId+'-table" class="visible-list-table alternating-rows-table lzm-unselectable" style="width: 100%;margin-top:1px;">' + this.CreateMatchingTicketsTableContent(_ticketList,elementId) + '</table></div>';
};

ChatTicketClass.prototype.CreateMatchingTicketsTableContent = function(tickets, elementId) {
    var that = this, lineCounter = 0, i;
    var tableHtml = '<thead><tr onclick="removeTicketContextMenu();">' +
        '<th style="width: 18px;">&nbsp;</th>' +
        '<th>&nbsp;</th>' +
        '<th style="width: 18px;">&nbsp;</th>';
    for (i=0; i<LocalConfiguration.TableColumns.ticket.length; i++) {
        var thisTicketColumn = LocalConfiguration.TableColumns.ticket[i];
        if (thisTicketColumn.display == 1) {
            var inactiveColumnClass = '';
            if (typeof thisTicketColumn.cell_id != 'undefined') {
                inactiveColumnClass = ((CommunicationEngine.ticketSort == 'update' && thisTicketColumn.cell_id == 'ticket-sort-update') ||
                    (CommunicationEngine.ticketSort == 'wait' && thisTicketColumn.cell_id == 'ticket-sort-wait') ||
                    (CommunicationEngine.ticketSort == '' && thisTicketColumn.cell_id == 'ticket-sort-date')) ? '' : ' inactive-sort-column';
            }
            var cellId = (typeof thisTicketColumn.cell_id != 'undefined') ? ' id="' + thisTicketColumn.cell_id + elementId + '"' : '';
            var cellClass = (typeof thisTicketColumn.cell_class != 'undefined') ? ' class="' + thisTicketColumn.cell_class + inactiveColumnClass + '"' : '';
            var cellStyle = (typeof thisTicketColumn.cell_style != 'undefined') ? ' style="position: relative; white-space: nowrap; ' + thisTicketColumn.cell_style + '"' : ' style="position: relative; white-space: nowrap;"';
            var cellOnclick = (typeof thisTicketColumn.cell_onclick != 'undefined') ? ' onclick="' + thisTicketColumn.cell_onclick + '"' : '';
            var cellIcon = (typeof thisTicketColumn.cell_class != 'undefined' && thisTicketColumn.cell_class == 'ticket-list-sort-column') ? '<span style="position: absolute; right: 4px;"><i class="fa fa-caret-down"></i></span>' : '';
            var cellRightPadding = (typeof thisTicketColumn.cell_class != 'undefined' && thisTicketColumn.cell_class == 'ticket-list-sort-column') ? ' style="padding-right: 25px;"' : '';
            tableHtml += '<th' + cellId + cellClass + cellStyle + cellOnclick + '><span' + cellRightPadding + '>' + t(thisTicketColumn.title) + '</span>' + cellIcon + '</th>';
        }
    }
    tableHtml += '</tr></thead><tbody>';
    for (i=0; i<tickets.length; i++)
        if (tickets[i].del == 0) {
            tableHtml += that.createTicketListLine(tickets[i], lineCounter, true, elementId,this.isFullscreenMode());
            lineCounter++;
        }

    tableHtml += '</tbody>';
    return tableHtml;
};

ChatTicketClass.prototype.setTicketDetailEvents = function(_showComments,_showMessages,_showLogs){
    $('#ticket-history-show-comments').change(function(){
        if($('#ticket-history-show-comments').prop('checked'))
            $('.message-comment-line').css('display','');
        else
            $('.message-comment-line').css('display','none');
    });
    $('#ticket-history-show-logs').change(function(){
        if($('#ticket-history-show-logs').prop('checked'))
            $('.message-log-line').css('display','');
        else
            $('.message-log-line').css('display','none');
    });
    $('#ticket-history-show-messages').change(function(){
        if($('#ticket-history-show-messages').prop('checked'))
        {
            $('.message-line').css('display','');
            $('#ticket-history-show-comments').parent().removeClass('ui-disabled');
        }
        else
        {
            $('.message-line').css('display','none');
            $('#ticket-history-show-comments').prop('checked',false);
            $('#ticket-history-show-comments').parent().addClass('ui-disabled');
        }
        $('#ticket-history-show-comments').change();
        $('#ticket-history-show-logs').change();
    });

    if(d(_showComments)){
        $('#ticket-history-show-comments').prop('checked',_showComments);
        $('#ticket-history-show-messages').prop('checked',_showMessages);
        $('#ticket-history-show-logs').prop('checked',_showLogs);
    }
    $('#ticket-history-show-comments').change();
    $('#ticket-history-show-logs').change();
    $('#ticket-history-show-messages').change();
};

ChatTicketClass.prototype.updateTicketDetails = function(selectedTicket) {

    var showMessages = $('#ticket-history-show-messages').prop('checked');
    var showLogs = $('#ticket-history-show-logs').prop('checked');
    var showComments = $('#ticket-history-show-comments').prop('checked');

    var selectedMessage = $('#ticket-history-table').data('selected-message'), that = this;
    var selectedGroup = DataEngine.groups.getGroup($('#ticket-details-group').val());
    var ticketId = selectedTicket.id + ' [' + selectedTicket.h + ']';
    var ticketDetails = that.createTicketDetails(ticketId, selectedTicket, {id: 0}, {cid: 0}, ' class="ui-disabled"', false, selectedGroup);
    var messageListHtml = that.createTicketMessageTable(selectedTicket, {id: ''}, selectedMessage, false, {cid: ''});

    $('#ticket-message-list').html('' + messageListHtml).trigger('create');
    $('#ticket-ticket-details').html('' + ticketDetails.html).trigger('create');

    $('#message-line-' + selectedTicket.id + '_' + selectedMessage).addClass('selected-table-line');
    $('.comment-line-' + selectedTicket.id  + '_' + selectedMessage).addClass('selected-table-line');

    var edit = $('#message-details-inner').data('edit');
    var messageNo = $('#ticket-history-table').data('selected-message');
    var message = selectedTicket.messages[messageNo];
    var detailsHtml = '' + lzm_chatDisplay.ticketDisplay.createTicketMessageDetails(message, {id: ''}, false, {cid: ''}, edit);
    var messageHtml = (edit) ? '<textarea id="change-message-text" data-role="none">' + message.mt + '</textarea>' : '' + lzm_commonTools.htmlEntities(message.mt).replace(/\n/g, '<br />');
    $('#ticket-message-details').html(detailsHtml);
    $('#ticket-message-text').html(messageHtml);
    $('#message-details-inner').data('message', message);
    $('#message-details-inner').data('email', {id: ''});
    $('#message-details-inner').data('is-new', false);
    $('#message-details-inner').data('chat', {cid: ''});
    $('#message-details-inner').data('edit', edit);


    that.createTicketDetailsChangeHandler(selectedTicket);
    that.setTicketDetailEvents(showComments,showMessages,showLogs);
    UIRenderer.resizeTicketDetails();
};

ChatTicketClass.prototype.showTicketDetails = function(ticket, isNew, email, chat, existingDialogId) {
    var that = this, saveClicked = false;
    isNew = (typeof isNew != 'undefined') ? isNew : false;
    existingDialogId = (typeof existingDialogId != 'undefined') ? existingDialogId : '';

    lzm_chatDisplay.ticket = ticket;
    var disabledString = (isNew && email.id == '' && chat.cid == '') ? '' : ' class="ui-disabled"';
    var myCustomInput, i;
    var bodyString = '';
    var fullScreenMode = this.isFullscreenMode();
    var selectedGroup = DataEngine.groups.getGroupList()[0];
    var headerString = '';

    if (isNew)
        headerString = t('Ticket');
    else
    {
        if (ticket.messages[0].fn != '')
            headerString = lzm_commonTools.htmlEntities(t('Ticket (<!--ticket_id-->, <!--name-->)',[['<!--ticket_id-->', ticket.id],['<!--name-->', ticket.messages[0].fn]]));
        else
            headerString = t('Ticket (<!--ticket_id-->)',[['<!--ticket_id-->', ticket.id]]);
    }

    var disabledButtonClass = (isNew) ? ' ui-disabled' : '';
    var footerString = '<span style="float: left;">';

    if(!isNew && (ticket.messages[0].cmb == '1' || ticket.type == '2'))
        footerString += lzm_inputControls.createButton('call-ticket-details', 'ticket-buttons' + disabledButtonClass, '', tid('phone_call'), '<i class="fa fa-phone"></i>', 'lr', {'margin-left': '6px'}, '', 20, 'e');

    footerString += lzm_inputControls.createButton('reply-ticket-details', 'ticket-buttons' + disabledButtonClass, '', tid('ticket_reply'), '<i class="fa fa-mail-reply"></i>', 'lr', {'margin-left': '6px'}, '', 20, 'e') +
        lzm_inputControls.createButton('ticket-actions', 'ticket-buttons' + disabledButtonClass, '', t('Actions'), '<i class="fa fa-wrench"></i>', 'lr', {'margin-left': '6px'}, '', 20, 'e') +        '</span>' +
        lzm_inputControls.createButton('save-ticket-details', 'ticket-buttons','', t('Ok'), '', 'lr',{'margin-left': '6px'}, '', 5, 'd') +
        lzm_inputControls.createButton('cancel-ticket-details', 'ticket-buttons','', t('Cancel'), '', 'lr',{'margin-left': '6px'}, '', 9, 'd') +
        lzm_inputControls.createButton('apply-ticket-details', 'ticket-buttons' + disabledButtonClass,'', t('Apply'), '', 'lr', {'margin-left': '6px'}, '', 9, 'd');

    var ticketHistoryHeadline = t('Ticket History');
    var lastMessage = (typeof ticket.messages != 'undefined') ? ticket.messages.length - 1 : -1;

    bodyString +='<div id="ticket-history-div" onclick="removeTicketMessageContextMenu();"><div id="ticket-history-placeholder"></div></div>';

    var historyTableHtml = '<div id="ticket-message-list" data-role="none">' + that.createTicketMessageTable(ticket, email, lastMessage, isNew, chat) + '</div>';
    var ticketDetailsPH = '<div id="ticket-details-div" onclick="removeTicketMessageContextMenu();"><div id="ticket-details-placeholder"></div></div>';

    if(fullScreenMode)
        bodyString += ticketDetailsPH;

    var ticketId = (typeof ticket.id != 'undefined') ? ticket.id + ' [' + ticket.h + ']' : '';
    var myDetails = that.createTicketDetails(ticketId, ticket, email, chat, disabledString, isNew, selectedGroup);
    var myMessage = (isNew) ? {} : ticket.messages[lastMessage];
    var messageDetailsHtml = '<div id="ticket-message-details" class="lzm-fieldset" data-role="none">' + that.createTicketMessageDetails(myMessage, email, isNew, chat, false) + '</div>';
    var ticketDetailsHtml = '<div id="ticket-ticket-details" class="lzm-fieldset" data-role="none">' + myDetails.html + '</div>';

    selectedGroup = myDetails.group;

    var menuEntry = (!isNew) ? t('Ticket (<!--ticket_id-->, <!--name-->)',[['<!--ticket_id-->', ticket.id],['<!--name-->', ticket.messages[0].fn]]) : (email.id == '') ? t('New Ticket') : t('New Ticket (<!--name-->)', [['<!--name-->', email.n]]);
    var attachmentsHtml = '<div id="ticket-attachment-list" data-role="none">' + that.createTicketAttachmentTable(ticket, email, lastMessage, isNew, 'ticket-details-placeholder-tab-1') + '</div>';
    var reminderHtml = this.getReminderHtml(ticket);
    var messageHtml = '<div class="lzm-dialog-headline5"></div><div id="ticket-message-text" class="lzm-fieldset" data-role="none" ondblclick="toggleMessageEditMode();">';

    if (d(ticket.messages))
        messageHtml += lzm_commonTools.htmlEntities(ticket.messages[lastMessage].mt).replace(/\n/g, '<br />');

    if (isNew)
    {
        var newTicketText = '';
        if(email.id != '')
            newTicketText = email.text;

        if(chat.cid != '')
        {
            if(d(chat.Messages) && chat.Messages.length)
            {
                for(var key in chat.Messages)
                {
                    if(!d(chat.Messages[key].info_header) && chat.Messages[key].sen != '0000000')
                        newTicketText += chat.Messages[key].text + "\r\n";
                }
            }
            if(!newTicketText.length)
            {
                if(d(chat.s))
                    newTicketText = chat.s;
            }
        }

        newTicketText = newTicketText.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
        messageHtml += '<textarea id="ticket-new-input" class="ticket-reply-text">' + newTicketText + '</textarea>';
    }

    messageHtml += '</div>';

    var dialogData = {'ticket-id': ticket.id, 'email-id': email.id, menu: menuEntry};
    var defaultCss = {};
    var dialogId = '';
    if (existingDialogId == '' && email.id == '' && chat.cid == '')
    {
        dialogId = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'ticket-details', defaultCss, {}, {}, {}, '', dialogData, true, true);
        $('#ticket-details-body').data('dialog-id', dialogId);
    }
    else if (existingDialogId != '' && email.id == '' && chat.cid == '')
    {
        lzm_displayHelper.minimizeDialogWindow(existingDialogId, 'visitor-information', {}, lzm_chatDisplay.selected_view, false);
        dialogId = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'ticket-details', defaultCss, {}, {}, {}, '', dialogData, true, true);
        $('#ticket-details-body').data('dialog-id', dialogId);
    }
    else if (email.id == '' && chat.cid != '')
    {
        dialogId = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'ticket-details', defaultCss, {}, {}, {}, '', dialogData, true, true);
        $('#ticket-details-body').data('dialog-id', dialogId);
    }
    else
    {
        lzm_displayHelper.minimizeDialogWindow(email['dialog-id'], 'email-list', {}, 'tickets', false);
        dialogId = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'email-list', defaultCss, {}, {}, {}, '', dialogData, true, true, email['dialog-id'] + '_ticket');
        $('#email-list-body').data('dialog-id', dialogId);
    }

    var ticketTabArray = [];
    if(!fullScreenMode)
    {
        ticketTabArray.push({name: tid('message'), content: ticketDetailsPH});
        if(!isNew)
            ticketTabArray.push({name: ticketHistoryHeadline, content: historyTableHtml});
    }
    else if(!isNew)
        ticketDetailsHtml += '<div id="ticket-history-table-placeholder"></div>';

    var ticketDetailsActiveTab = 0;
    ticketTabArray.push({name: t('Ticket Details'), content: ticketDetailsHtml});

    lzm_displayHelper.createTabControl('ticket-history-placeholder', ticketTabArray, ticketDetailsActiveTab);
    lzm_displayHelper.createTabControl('ticket-details-placeholder', [
        {name: tid('details'), content: messageDetailsHtml + messageHtml},
        {name: tid('attachments'), content: attachmentsHtml},
        {name: tid('reminder'), content: reminderHtml}]);

    if (!isNew && fullScreenMode)
            lzm_displayHelper.createTabControl('ticket-history-table-placeholder', [{name: t('History'), content: historyTableHtml}],0);

    if(fullScreenMode || (!isNew && ticket.messages.length==1))
        $('#message-line-' + ticket.id + '_' + (lastMessage)).click();

    $('.ui-collapsible-content').css({'overflow-x': 'auto'});
    that.createTicketDetailsChangeHandler(ticket);

    $('#message-details-inner').data('message', myMessage);
    $('#message-details-inner').data('email', email);
    $('#message-details-inner').data('is-new', isNew);
    $('#message-details-inner').data('chat', chat);
    $('#message-details-inner').data('edit', false);

    $('#rem-active').change(function() {
        if(!$('#rem-active').prop('checked'))
            $('#rem-settings').addClass('ui-disabled');
        else
            $('#rem-settings').removeClass('ui-disabled');
    });
    $('#rem-active').change();

    $('#add-attachment-from-qrd').click(function() {
        lzm_displayHelper.minimizeDialogWindow(dialogId, 'ticket-details',
            {'ticket-id': -1, menu: menuEntry}, 'tickets', false);
        var fileResources = DataEngine.cannedResources.getResourceList('ti', {ty: '0,3,4'});
        lzm_chatDisplay.resourcesDisplay.createQrdTreeDialog(fileResources, 'ATTACHMENT~' + dialogId, menuEntry);
    });
    $('#remove-attachment').click(function() {
        var resources = $('#ticket-details-placeholder-content-1').data('selected-resources');
        resources = (typeof resources != 'undefined') ? resources : [];
        var tmpResources = [];
        for (var i=0; i<resources.length; i++) {
            if (i != $('#attachment-table').data('selected-attachment')) {
                tmpResources.push(resources[i]);
            }
        }
        $('#ticket-details-placeholder-content-1').data('selected-resources', tmpResources);
        that.updateAttachmentList();
        $('#attachment-table').data('selected-attachment', -1);
        $('#remove-attachment').addClass('ui-disabled');
    });
    $('#ticket-actions').click(function(e) {
        e.stopPropagation();
        if (lzm_chatDisplay.showTicketMessageContextMenu)
        {
            removeTicketMessageContextMenu();
        }
        else
        {
            openTicketMessageContextMenu(e, ticket.id, '', true);
        }
    });
    $('#call-ticket-details').click(function() {
        var openTicket = lzm_commonTools.clone(ticket);
        showPhoneCallDialog(openTicket.id, '0', 'ticket');
    });
    $('#reply-ticket-details').click(function() {

        try
        {

            var opName = t('another operator'), confirmText = '';
            var openTicket = lzm_commonTools.clone(ticket);
            for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++)
                if (lzm_chatDisplay.ticketListTickets[i].id == ticket.id)
                    openTicket = lzm_commonTools.clone(lzm_chatDisplay.ticketListTickets[i]);

            if (d(openTicket.editor) && openTicket.editor != false)
            {
                var eop = DataEngine.operators.getOperator(openTicket.editor.ed);
                if(eop != null)
                {
                    opName = eop.name;
                    confirmText = t('This ticket is already processed by <!--op_name-->. Do you really want to take it over?', [['<!--op_name-->', opName]]);
                }
            }


            var handleTicketTakeOver = function(){
                if (!d(openTicket.editor) || !openTicket.editor || openTicket.editor.ed == '' || openTicket.editor.ed != lzm_chatDisplay.myId || openTicket.editor.st != 1)
                {
                    var myGroup = (d(openTicket.editor) && openTicket.editor != false) ? openTicket.editor.g : openTicket.gr;
                    initSaveTicketDetails(openTicket, openTicket.t, 1, myGroup, lzm_chatDisplay.myId, openTicket.l);
                    uploadSaveTicketDetails();
                    if (!d(openTicket.editor) || openTicket.editor == false)
                    {
                        var now = lzm_chatTimeStamp.getServerTimeString(null, true);
                        openTicket.editor = {id: openTicket.id, u: now, w: now, st: 0, ti: now, g: myGroup};
                    }
                    openTicket.editor.ed = lzm_chatDisplay.myId;
                }

                if(that.updatedTicket != null && that.updatedTicket.id == ticket.id)
                    openTicket.l = that.updatedTicket.l;

                that.showMessageReply(openTicket, $('#ticket-history-table').data('selected-message'), selectedGroup, menuEntry);

            };
            if (!d(openTicket.editor) || !openTicket.editor || openTicket.editor.ed == '' || openTicket.editor.ed == lzm_chatDisplay.myId)
            {
                handleTicketTakeOver();
            }
            else
            {
                lzm_commonDialog.createAlertDialog(confirmText, [{id: 'ok', name: t('Ok')}, {id: 'cancel', name: t('Cancel')}]);
                $('#alert-btn-ok').click(function() {
                    if (that.checkTicketTakeOverReply()) {
                        handleTicketTakeOver();
                        lzm_commonDialog.removeAlertDialog();
                    }
                });
                $('#alert-btn-cancel').click(function() {
                    lzm_commonDialog.removeAlertDialog();
                });
            }
        }
        catch(ex)
        {
            deblog(ex);
        }
    });
    $('#apply-ticket-details').click(function() {
        var myStatus = $('#ticket-details-status').val();
        if (!that.checkTicketDetailsChangePermission(ticket, {status: myStatus})) {
            showNoPermissionMessage();
        }
        else
        {
            for (var i=0; i<DataEngine.tickets.length; i++)
                if (DataEngine.tickets[i].id == ticket.id)
                    ticket = lzm_commonTools.clone(DataEngine.tickets[i]);

            var rem_time = 0;
            var rem_status = 2;

            if($('#rem-active').prop('checked'))
            {
                try
                {
                    rem_status = $("#ticket-reminder input[type='radio']:checked").val();
                    var remDate = new Date($('#rem-date-year').val(),parseInt($('#rem-date-month').val())-1,$('#rem-date-day').val(),$('#rem-date-hour').val(),$('#rem-date-minute').val(),0,0);
                    rem_time = parseInt((remDate.getTime()/1000) + parseInt(lzm_chatTimeStamp.timeDifference));

                    if(isNaN(rem_time))
                        rem_time = 0;
                }
                catch(ex) {rem_time = 0;}
            }

            if(d(ticket.id) && $('#ticket-details-priority').prop('selectedIndex').toString() != ticket.p)
                setTicketPriority(ticket.id,$('#ticket-details-priority').prop('selectedIndex').toString());

            var attachments, comments, customFields = {};
            if (email.id == '' && chat.cid == '')
            {
                var mc = '';
                if ($('#message-details-inner').data('edit')) {
                    var changedMessage = $('#message-details-inner').data('message');
                    mc = {tid: ticket.id, mid: changedMessage.id,
                        n: $('#change-message-name').val(), e: $('#change-message-email').val(),
                        c: $('#change-message-company').val(), p: $('#change-message-phone').val(),
                        s: $('#change-message-subject').val(), t: $('#change-message-text').val(),
                        custom: []};
                    for (i=0; i<DataEngine.inputList.idList.length; i++) {
                        myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[i]);
                        var myCustomInputValue = DataEngine.inputList.getControlValue(myCustomInput,'change-message-custom-' + myCustomInput.id);

                        if (myCustomInput.active == 1 && typeof myCustomInputValue != 'undefined')
                            mc.custom.push({id: DataEngine.inputList.idList[i], value:myCustomInputValue});
                    }
                }
                attachments = $('#ticket-details-placeholder-content-1').data('selected-resources');
                attachments = (typeof attachments != 'undefined') ? attachments : [];
                customFields = that.readCustomFields();

                initSaveTicketDetails(ticket, $('#ticket-details-channel').val(), $('#ticket-details-status').val(),
                    $('#ticket-details-group').val(), $('#ticket-details-editor').val(), $('#ticket-details-language').val(),
                    $('#ticket-new-name').val(), $('#ticket-new-email').val(), $('#ticket-new-company').val(), $('#ticket-new-phone').val(),
                    $('#ticket-new-input').val(), attachments, comments, customFields,$('#ticket-details-sub-status').val(),$('#ticket-details-sub-channel').val(), {cid: ''}, mc,$('#ticket-new-subject').val(),rem_time,rem_status, $('#ticket-details-priority').val());
                uploadSaveTicketDetails(isNew ? 'new-ticket' : 'save-details',{cid: ''});
            }
            else if (email.id == '' && chat.cid != '')
            {
                attachments = $('#ticket-details-placeholder-content-1').data('selected-resources');
                attachments = (typeof attachments != 'undefined') ? attachments : [];
                customFields = that.readCustomFields();

                initSaveTicketDetails(ticket, $('#ticket-details-channel').val(), $('#ticket-details-status').val(),
                    $('#ticket-details-group').val(), $('#ticket-details-editor').val(), $('#ticket-details-language').val(),
                    $('#ticket-new-name').val(), $('#ticket-new-email').val(), $('#ticket-new-company').val(), $('#ticket-new-phone').val(),
                    $('#ticket-new-input').val(), attachments, comments, customFields, $('#ticket-details-sub-status').val(),$('#ticket-details-sub-channel').val(), chat,'',$('#ticket-new-subject').val(),rem_time,rem_status, $('#ticket-details-priority').val());
                uploadSaveTicketDetails(isNew ? 'new-ticket' : 'save-details',chat);
            }
            else
            {
                customFields = that.readCustomFields();

                lzm_chatDisplay.ticketsFromEmails.push({'email-id': email.id, ticket: ticket, channel: $('#ticket-details-channel').val(), status: $('#ticket-details-status').val(),
                    group: $('#ticket-details-group').val(), editor: $('#ticket-details-editor').val(), language: $('#ticket-details-language').val(),
                    name: $('#ticket-new-name').val(), email: $('#ticket-new-email').val(), company: $('#ticket-new-company').val(), phone: $('#ticket-new-phone').val(),
                    message: $('#ticket-new-input').val(), subject: $('#ticket-new-subject').val(), attachment: email.attachment, comment: comments, custom: customFields});
            }
            if ($('#message-details-inner').data('edit')) {
                toggleMessageEditMode(null, null, true);
            }
        }
    });
    $('#save-ticket-details').click(function() {
        saveClicked = true;
        $('#apply-ticket-details').click();
        $('#cancel-ticket-details').click();
    });
    $('#cancel-ticket-details').click(function() {
        if($.inArray(ticket.id,that.pausedTicketReplies) != -1)
        {
            $('#reply-ticket-details').click();
            return;
        }

        var edit = $('#message-details-inner').data('edit');
        if(edit)
        {
            toggleMessageEditMode(null, null, false);
            return;
        }
        if (email.id != '')
        {
            lzm_displayHelper.removeDialogWindow('email-list');
            maximizeDialogWindow(email['dialog-id']);
            if (!saveClicked) {
                setTimeout(function() {
                    $('#reset-emails').click();
                }, 50);
            }
            scrollToEmail(that.selectedEmailNo);
        }
        else if (chat.cid != '')
        {
            lzm_displayHelper.removeDialogWindow('ticket-details');
            //maximizeDialogWindow(chat['dialog-id']);
        }
        else if (existingDialogId != '')
        {
            lzm_displayHelper.removeDialogWindow('ticket-details');
            maximizeDialogWindow(existingDialogId);
        }
        else
        {
            lzm_displayHelper.removeDialogWindow('ticket-details');
        }


        lzm_chatDisplay.ticketOpenMessages = [];
    });

    that.setTicketDetailEvents();
    UIRenderer.resizeTicketDetails();

    if (!fullScreenMode && !isNew)
        $('#ticket-history-placeholder-tab-1').click();

    return dialogId;
};

ChatTicketClass.prototype.readCustomFields = function(){
    var customFields = {},myCustomInput  = null;
    for (var i=0; i<DataEngine.inputList.idList.length; i++) {
        myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[i]);
        if (myCustomInput.active == 1 && parseInt(myCustomInput.id) < 111)
            customFields[myCustomInput.id] = DataEngine.inputList.getControlValue(myCustomInput,'ticket-new-cf' + myCustomInput.id);
    }
    return customFields;
};

ChatTicketClass.prototype.getReminderHtml = function(ticket){

    var status = '1';
    var span =  lzm_commonStorage.loadValue('ticket_reminder_span_' + DataEngine.myId);
    if(span == null)
        span = 604800;

    var suggDate = lz_global_timestamp()+span;
    var date = new Date(suggDate*1000);

    if(typeof ticket.AutoStatusUpdateTime != 'undefined' && ticket.AutoStatusUpdateTime > lz_global_timestamp()){
        date = new Date(ticket.AutoStatusUpdateTime*1000);
        status = ticket.AutoStatusUpdateStatus;

    }

    return '<div id="ticket-reminder" class="left-space" data-role="none">' +
        '<div class="top-space">'+lzm_inputControls.createCheckbox('rem-active',tidc('reminder_active'),typeof ticket.AutoStatusUpdateTime != 'undefined')+'</div>'+
        '<div class="left-space-child" id="rem-settings">' +
        '<div class="top-space-half">'+lzm_inputControls.createRadio('rem-status_0','','rem-status',tid('ticket_status_0'),status=='0','0')+'</div>'+
        '<div>'+lzm_inputControls.createRadio('rem-status_1','','rem-status',tid('ticket_status_1'),status=='1','1')+'</div>'+
        '<div>'+lzm_inputControls.createRadio('rem-status_2','','rem-status',tid('ticket_status_2'),status=='2','2')+'</div>'+
        '<div>'+lzm_inputControls.createRadio('rem-status_3','','rem-status',tid('ticket_status_3'),status=='3','3')+'</div>'+
        '<table class="top-space" style="max-width:300px;"><tr>' +
        '<td>' + lzm_inputControls.createInput('rem-date-day','',date.getDate(),tidc('day'),'','number','')+
        '</td><td>' + lzm_inputControls.createInput('rem-date-month','',date.getMonth()+1,tidc('month'),'','number','')+
        '</td><td>' + lzm_inputControls.createInput('rem-date-year','',date.getFullYear(),tidc('year'),'','number','')+
        '</td><td style="padding-left:10px;">' +lzm_inputControls.createInput('rem-date-hour','',date.getHours(),tidc('hour'),'','number','')+
        '</td><td>' + lzm_inputControls.createInput('rem-date-minute','',date.getMinutes(),tidc('minute'),'','number','')+
        '</td></tr></table>' +
        '</div></div>';
}

ChatTicketClass.prototype.isFullscreenMode = function(){
    return (lzm_chatDisplay.windowHeight > 450 && lzm_chatDisplay.windowWidth > 575);
};

ChatTicketClass.prototype.updateAttachmentList = function() {
    var tableString = '';
    var resources1 = $('#reply-placeholder-content-1').data('selected-resources');
    var resources2 = $('#ticket-details-placeholder-content-1').data('selected-resources');
    var resources = (typeof resources1 != 'undefined') ? resources1 : (typeof resources2 != 'undefined') ? resources2 : [];

    for (var i=0; i<resources.length; i++) {
        myDownloadLink = getQrdDownloadUrl({rid: resources[i].rid, ti: resources[i].ti});
        var fileTypeIcon = lzm_chatDisplay.resourcesDisplay.getFileTypeIcon(resources[i].ti);
        tableString += '<tr id="attachment-line-' + i + '" class="attachment-line" style="cursor:pointer;"' +
            ' onclick="handleTicketAttachmentClick(' + i + ');">' +
            '<td class="icon-column">' + fileTypeIcon + '</td><td style="text-decoration: underline; white-space: nowrap; cursor: pointer;"><a href="#" class="lz_chat_link_no_icon" onclick="downloadFile(\'' + myDownloadLink + '\')">' +
            lzm_commonTools.htmlEntities(resources[i].ti) + '</a></td><td></td></tr>';
    }
    $('#attachment-table').children('tbody').html(tableString);
};

ChatTicketClass.prototype.updateCommentList = function() {

};

ChatTicketClass.prototype.createTicketDetails = function(ticketId, ticket, email, chat, disabledString, isNew, selectedGroup) {

    var i,selectedString, selectedLanguage = '', availableLanguages = [], disabledClass;

    var detailsHtml = '<table id="ticket-details-inner">';detailsHtml += '<tr><th><label for="ticket-details-id">' + t('Ticket ID:') + '</label></th><td colspan="2"><div id="ticket-details-id" class="input-like">' + ticketId + '</div></td></tr>';
        detailsHtml += '<tr><th><label for="ticket-details-channel">' + tid('channel') + '</label></th><td><select id="ticket-details-channel" class="lzm-select" data-role="none"' + disabledString + '>';

    // CHANNEL
    for (var aChannel=0; aChannel<ChatTicketClass.m_TicketChannels.length; aChannel++)
    {
        var channel = ChatTicketClass.m_TicketChannels[aChannel];
        selectedString = (channel.index == ticket.t || (email.id != '' && channel.key == 'email')) ? ' selected="selected"' : (chat.cid != '' && channel.index == 4) ? ' selected="selected"' : '';
        if (!isNew || channel.index < 6)
            detailsHtml += '<option' + selectedString + ' value="' + channel.index + '">' + channel.title + '</option>';
    }

    //SUBCHANNEL
    detailsHtml += '</select></td>';
    detailsHtml += '<td><select id="ticket-details-sub-channel" class="lzm-select" data-role="none"></select>';

    // STATUS
    detailsHtml += '</td></tr><tr><th><label for="ticket-details-status">' + tid('ticket_status') + '</label></th>';
    disabledClass = (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'change_ticket_status', {})) ? '' : ' class="ui-disabled"';
    detailsHtml += '<td><select id="ticket-details-status" class="lzm-select" data-role="none"' + disabledClass + '>';
    var states = [tid('ticket_status_0'), tid('ticket_status_1'), tid('ticket_status_2'), tid('ticket_status_3')];
    for (var aState=0; aState<states.length; aState++) {
        selectedString = (typeof ticket.editor != 'undefined' && ticket.editor != false && aState == ticket.editor.st) ? ' selected="selected"' : '';
        detailsHtml += '<option' + selectedString + ' value="' + aState + '">' + states[aState] + '</option>';
    }

    // SUBSTATUS
    detailsHtml += '</select></td><td><select id="ticket-details-sub-status" class="lzm-select" data-role="none"' + disabledClass + '>';

    // GROUP
    detailsHtml += '</select></td></tr><tr><th><label for="ticket-details-group">' + t('Group:') + '</label></th>';
    disabledClass = (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'assign_groups', {})) ? '' : ' class="ui-disabled"';
    detailsHtml += '<td colspan="2"><select id="ticket-details-group" class="lzm-select" data-role="none"' + disabledClass + '>';

    var preSelectedGroup = '';
    if (email.id != '')
        preSelectedGroup = email.g;
    else
        preSelectedGroup = (isNew) ? lzm_chatDisplay.myGroups[0] : '';

    if(this.updatedTicket!=null && this.updatedTicket.id == ticket.id){
        ticket.l = this.updatedTicket.l;
        ticket.gr = this.updatedTicket.gr;
    }

    var groups = DataEngine.groups.getGroupList(), langName = '';
    for (i=0; i<groups.length; i++) {
        selectedString = '';
        if (typeof ticket.editor != 'undefined' && ticket.editor != false) {
            if (groups[i].id == ticket.editor.g) {
                selectedString = ' selected="selected"';
                selectedGroup = groups[i];
                selectedLanguage = groups[i].pm[0].lang;
            }
        } else {
            if (typeof ticket.gr != 'undefined' && groups[i].id == ticket.gr) {
                selectedString = ' selected="selected"';
                selectedGroup = groups[i];
                selectedLanguage = groups[i].pm[0].lang;
            } else if (groups[i].id == preSelectedGroup) {
                selectedString = ' selected="selected"';
                selectedGroup = groups[i];
                selectedLanguage = groups[i].pm[0].lang;
            }
        }
        detailsHtml += '<option value="' + groups[i].id + '"' + selectedString + '>' + groups[i].name + '</option>';
    }
    detailsHtml += '</select></td></tr><tr><th><label for="ticket-details-editor">' + t('Editor:') + '</label></th>';
    disabledClass = (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'assign_operators', {})) ? '' : ' class="ui-disabled"';
    detailsHtml += '<td colspan="2"><select id="ticket-details-editor" class="lzm-select" data-role="none"' + disabledClass + '><option value="-1">' + tid('none') + '</option>';
    var operators = DataEngine.operators.getOperatorList('name', selectedGroup.id);
    for (i=0; i<operators.length; i++) {
        if (operators[i].isbot != 1) {
            selectedString = (typeof ticket.editor != 'undefined' && ticket.editor != false && ticket.editor.ed == operators[i].id) ? ' selected="selected"' : '';
            detailsHtml += '<option' + selectedString + ' value="' + operators[i].id + '">' + operators[i].name + '</option>';
        }
    }

    detailsHtml += '</select></td></tr><tr><th><label for="ticket-details-language">' + tidc('language') + '</label></th><td colspan="2"><select id="ticket-details-language" class="lzm-select" data-role="none">';

    for (i=0; i<selectedGroup.pm.length; i++)
    {
        availableLanguages.push(selectedGroup.pm[i].lang);
        selectedString = '';

        if((typeof ticket.l != 'undefined' && selectedGroup.pm[i].lang.toLowerCase() == ticket.l.toLowerCase()) || (email.id != '' && selectedGroup.pm[i].def == '1'))
        {
            selectedString = ' selected="selected"';
            selectedLanguage = selectedGroup.pm[i].lang;
        }

        if(selectedLanguage == '' && selectedGroup.pm[i].lang.toLowerCase() == DataEngine.defaultLanguage.toLowerCase())
        {
            selectedString = ' selected="selected"';
            selectedLanguage = selectedGroup.pm[i].lang;
        }

        langName = lzm_chatDisplay.getLanguageDisplayName(selectedGroup.pm[i].lang);
        detailsHtml += '<option value="' + selectedGroup.pm[i].lang + '"' + selectedString + '>' + langName + '</option>';
    }
    if (typeof ticket.l != 'undefined' && $.inArray(ticket.l, availableLanguages) == -1) {
        langName = (typeof lzm_chatDisplay.availableLanguages[ticket.l.toLowerCase()] != 'undefined') ?
            ticket.l + ' - ' + lzm_chatDisplay.availableLanguages[ticket.l.toLowerCase()] :
            (typeof lzm_chatDisplay.availableLanguages[ticket.l.toLowerCase().split('-')[0]] != 'undefined') ?
                ticket.l + ' - ' + lzm_chatDisplay.availableLanguages[ticket.l.toLowerCase().split('-')[0]] :
                ticket.l;
        detailsHtml += '<option value="' + ticket.l + '" selected="selected">' + langName + '</option>';
        selectedLanguage = ticket.l;
    }
    detailsHtml += '</select></td></tr>';
    detailsHtml += '<tr><th><label for="ticket-details-priority">' + tidc('priority') + '</label></th><td colspan="2"><select id="ticket-details-priority" class="lzm-select" data-role="none">';

    for(i=0;i<5;i++){
        selectedString = (i==ticket.p || (isNew && i==2)) ? ' selected="selected"' : '';
        detailsHtml += '<option value="'+ i.toString()+'"'+selectedString+'>'+tid('priority_'+ i.toString())+'</option>';
    }
    detailsHtml += '</select></td></tr></table>';

    return {html: detailsHtml, language: selectedLanguage, group: selectedGroup}
};

ChatTicketClass.prototype.createTicketAttachmentTable = function(ticket, email, messageNumber, isNew, tabName) {
    var acount = 0, j, downloadUrl;
    var attachmentsHtml = "", previewHtml = '';

    if(isNew && email.id == '')
    {
        var disabledClass = (ticket.t == 6 || ticket.t == 7) ? 'ui-disabled' : '';
        attachmentsHtml += '<div class="lzm-dialog-headline3">' +
            lzm_inputControls.createButton('remove-attachment', 'ui-disabled', '', t('Remove'), '<i class="fa fa-remove"></i>', 'lr',  {float:'right','margin-right':'4px'}, t('Remove Attachment')) +
            lzm_inputControls.createButton('add-attachment', disabledClass, '', t('Add'), '<i class="fa fa-upload"></i>', 'lr',  {float:'right','margin-right':'4px'}, t('Add Attachment')) +
            lzm_inputControls.createButton('add-attachment-from-qrd', disabledClass, '', t('Add from resource'), '<i class="fa fa-database"></i>', 'lr', {float:'right','margin-right':'4px'}, t('Add Attachment from Resource')) +
            '</div>';
    }

    attachmentsHtml += '<table id="attachment-table" class="visible-list-table alternating-rows-table lzm-unselectable"><thead><tr><th style=\'width: 18px !important;\'></th><th>' + t('File name') + '</th><th style="width:30px;"></th></tr></thead><tbody>';

    if (ticket != null && d(ticket.messages) && typeof ticket.messages[messageNumber] != 'undefined' && typeof ticket.messages[messageNumber].attachment != 'undefined') {
        for (j=0; j<ticket.messages[messageNumber].attachment.length; j++) {
            acount++;
            downloadUrl = getQrdDownloadUrl({
                ti: lzm_commonTools.htmlEntities(ticket.messages[messageNumber].attachment[j].n),
                rid: ticket.messages[messageNumber].attachment[j].id
            });


            var event = 'handleTicketAttachmentClick(' + j + ');';
            if(lzm_commonTools.isImageFile(ticket.messages[messageNumber].attachment[j].n))
                event+='previewTicketAttachment(\''+downloadUrl+'\');';
            else
                event+='previewTicketAttachment(null);';
            attachmentsHtml += '<tr id="attachment-line-' + j + '" class="attachment-line lzm-unselectable" style="cursor:pointer;" onclick="'+event+'">';

            var fileTypeIcon = lzm_chatDisplay.resourcesDisplay.getFileTypeIcon(ticket.messages[messageNumber].attachment[j].n);
            attachmentsHtml += '<td class="icon-column" style="text-align: center;">' + fileTypeIcon + '</td><td' +
                ' style="text-decoration: underline; white-space: nowrap; cursor: pointer;" onclick="">' +
                lzm_commonTools.htmlEntities(ticket.messages[messageNumber].attachment[j].n) +
                '</td><td>' +
                lzm_inputControls.createButton(messageNumber+"-"+j+"dnl",'','downloadFile(\'' + downloadUrl + '\')', '', '<i class="fa fa-cloud-download nic"></i>', 'lr', {float:'right','margin-right':'4px'}, t('Download')) +
                '</td></tr>';
        }

        if(ticket.messages[messageNumber].attachment.length>0){
            previewHtml = '<div class="lzm-dialog-headline5"></div>';
            previewHtml +='<div id="att-img-preview-field"></div>';
        }
    }
    if (email.id != '') {
        for (var l=0; l<email.attachment.length; l++) {
            downloadUrl = getQrdDownloadUrl({
                ti: lzm_commonTools.htmlEntities(email.attachment[l].n),
                rid: email.attachment[l].id
            });
            attachmentsHtml += '<tr class="lzm-unselectable">' +
                '<td class="icon-column" style="">' + lzm_chatDisplay.resourcesDisplay.getFileTypeIcon(email.attachment[l].n) + '</td><td>' +
                lzm_commonTools.htmlEntities(email.attachment[l].n) +
                '</td><td>' +
                lzm_inputControls.createButton(email.attachment[l].id+"-"+l+"dnl",'','downloadFile(\'' + downloadUrl + '\')', '', '<i class="fa fa-cloud-download nic"></i>', 'lr', {float:'right','margin-right':'4px'}, t('Download')) +
                '</td></tr>';
        }
    }
    attachmentsHtml += '</tbody></table>' + previewHtml;
    if(typeof tabName != 'undefined'){
        acount = (acount > 0) ? ' (' + acount + ')' : '';
        $('#'+tabName).html(tid('attachments')+acount);
    }
    return attachmentsHtml;
};

ChatTicketClass.prototype.createTicketCommentTable = function(ticket, messageNumber, menuEntry, tabName) {
    return '';
};

ChatTicketClass.prototype.showMessageReply = function(ticket, messageNo, selectedGroup, menuEntry) {

    menuEntry = (typeof menuEntry != 'undefined') ? menuEntry : '';
    var that = this;
    var i, j = 0, signatureText = '', answerInline = false, mySig = {};
    messageNo = (messageNo == -1) ? ticket.messages.length -1 : messageNo;
    var myself = DataEngine.operators.getOperator(lzm_chatDisplay.myId);
    var signatures = [];
    var groups = DataEngine.groups.getGroupList();
    var rDiaId = lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply';

    if($.inArray(ticket.id,this.pausedTicketReplies) != -1)
    {
        lzm_displayHelper.minimizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id], 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);
        lzm_displayHelper.maximizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply');
        $('#ticket-reply-input').focus();
        lzm_chatDisplay.ticketDisplay.pausedTicketReplies.splice($.inArray(ticket.id,lzm_chatDisplay.ticketDisplay.pausedTicketReplies), 1 );
        return;
    }

    for (i=0; i<myself.sig.length; i++) {
        mySig = myself.sig[i];
        mySig.priority = 4;
        if (myself.sig[i].d == 1) {
            mySig.priority = 5;
        }
        signatures.push(mySig);
    }
    for (i=0; i<groups.length; i++) {
        if ($.inArray(groups[i].id, myself.groups) != -1) {
            for (j=0; j<groups[i].sig.length; j++) {
                mySig =  groups[i].sig[j];
                mySig.priority = 0;
                if (groups[i].sig[j].d == 1 && groups[i].sig[j].g != selectedGroup.id) {
                    mySig.priority = 1;
                } else if (groups[i].sig[j].d != 1 && groups[i].sig[j].g == selectedGroup.id) {
                    mySig.priority = 2;
                } else if (groups[i].sig[j].d == 1 && groups[i].sig[j].g == selectedGroup.id) {
                    mySig.priority = 3;
                }
                signatures.push(mySig);
            }
        }
    }
    signatures.sort(function(a, b) {
        return (a.d < b.d);
    });

    var salutationFields = lzm_commonTools.getTicketSalutationFields(ticket, messageNo);
    var checkedString = (ticket.t != 6 && ticket.t != 7) ? ' checked="checked"' : '';
    var disabledString2 = (ticket.t == 6 || ticket.t == 7) ? ' ui-disabled' : '';
    var disabledString;

    var salBreaker = ($('#ticket-details-body').width() < 800) ? "" : "";
    var replyString = '<table id="ticket-reply" class="tight">' +
        '<tr><td><fieldset class="lzm-fieldset" data-role="none"><legend>' + t('Salutation') + '</legend>' +
        '<div id="tr-enable-salutation-fields" style="padding-bottom: 8px;">' +
        '<input type="checkbox" id="enable-tr-salutation" class="checkbox-custom" data-role="none"' + checkedString + ' />' +
        '<label for="enable-tr-salutation" class="checkbox-custom-label">' + t('Use salutation') + '</label></div>' +
        '<div class="tr-salutation-fields' + disabledString2 + '">';
    checkedString = (salutationFields['salutation'][0]) ? ' checked="checked"' : '';
    disabledString = (salutationFields['salutation'][0]) ? '' : ' class="ui-disabled"';

    replyString += '<span><span id="tr-greet-placeholder"' + disabledString + '></span><input type="checkbox" id="use-tr-greet" class="checkbox-custom" data-role="none"' + checkedString + ' /><label for="use-tr-greet" class="checkbox-custom-label"></label><span> ';
    checkedString = (salutationFields['title'][0]) ? ' checked="checked"' : '';
    disabledString = (salutationFields['title'][0]) ? '' : ' class="ui-disabled"';

    replyString += '<span><span id="tr-title-placeholder"' + disabledString + '></span><input type="checkbox" id="use-tr-title" class="checkbox-custom" data-role="none"' + checkedString + ' /><label for="use-tr-title" class="checkbox-custom-label"></label></span> ';
    replyString += salBreaker;
    checkedString = (salutationFields['first name'][0]) ? ' checked="checked"' : '';
    disabledString = (salutationFields['first name'][0]) ? '' : ' class="ui-disabled"';

    replyString += '<span><span class="lzm-input lzm-input-medium"><input type="text" id="tr-firstname"' + disabledString + ' data-role="none" placeholder="' + t('First Name') + '" value="' + capitalize(salutationFields['first name'][1]) + '" /></span>';
    replyString += '<input type="checkbox" id="use-tr-firstname" class="checkbox-custom" data-role="none"' + checkedString + ' /><label for="use-tr-firstname" class="checkbox-custom-label"></label></span> ';
    replyString += salBreaker;

    if(this.isFullscreenMode())
        replyString += '<span><i style="font-size:20px;vertical-align:middle;padding:0 5px 2px 0;cursor:pointer;" onclick="switchTicketNames();" class="fa fa-arrows-h"></i></span>';

    checkedString = (salutationFields['last name'][0]) ? ' checked="checked"' : '';
    disabledString = (salutationFields['last name'][0]) ? '' : ' class="ui-disabled"';
    replyString += '<span class="lzm-input lzm-input-medium"><input type="text" id="tr-lastname"' + disabledString + ' data-role="none" placeholder="' + t('Last Name') + '" value="' + capitalize(salutationFields['last name'][1]) + '" /></span>';

    replyString += '<input type="checkbox" id="use-tr-lastname" class="checkbox-custom" data-role="none"' + checkedString + ' /><label for="use-tr-lastname" class="checkbox-custom-label"></label>';
    replyString += salBreaker;
    replyString += '<input type="text" id="tr-punctuationmark" data-role="none" style="width: 20px; margin: 2px;" value="' + salutationFields['punctuation mark'][1][0][0] + '" />' +
        '</div></fieldset></td></tr>' +
        '<tr><td><fieldset class="lzm-fieldset" data-role="none"><legend>' + t('Introduction Phrase') + '</legend>' +
        '<div class="tr-salutation-fields' + disabledString2 + '">';

    checkedString = (salutationFields['introduction phrase'][0]) ? ' checked="checked"' : '';
    disabledString = (salutationFields['introduction phrase'][0]) ? '' : ' class="ui-disabled"';
    replyString += '<span id="tr-intro-placeholder"' + disabledString + '></span>' +
        '<input type="checkbox" id="use-tr-intro" class="checkbox-custom" data-role="none"' + checkedString + ' /><label for="use-tr-intro" class="checkbox-custom-label"></label>' +
        '</div></fieldset></td></tr><tr><td><fieldset class="lzm-fieldset" data-role="none"><legend>' + t('Mail Text') + '</legend><div id="message-reply-container" style="margin:0;width:100%;">' +
        '<div id="ticket-reply-input-buttons" class="bottom-space" style="padding:5px 0;">' +
        lzm_inputControls.createButton('ticket-reply-input-load', '', '', t('Load'), '<i class="fa fa-folder-open-o"></i>', 'lr', {'margin-left': '0px'}) +
        lzm_inputControls.createButton('ticket-reply-input-save', 'ui-disabled', '', t('Save'), '<i class="fa fa-save"></i>', 'lr',  {'margin-left': '3px'}) +
        lzm_inputControls.createButton('ticket-reply-input-saveas', '', '', t('Save As ...'), '<i class="fa fa-plus"></i>', 'lr', {'margin-left': '3px'}) +
        lzm_inputControls.createButton('ticket-reply-input-clear', '', '', t('Clear'), '<i class="fa fa-remove"></i>', 'lr',{'margin-left': '3px'}) +
        lzm_inputControls.createButton('ticket-reply-reply-inline', '', '', t('Reply Inline'), '<i class="fa fa-terminal"></i>', 'lr',{'margin-left': '3px'}) +
        lzm_inputControls.createButton('ticket-reply-show-question', '', '', t('Show Question'), '<i class="fa fa-question"></i>', 'lr',{'margin-left': '3px'}) +
        '</div><div id="ticket-reply-inline-show-div" style="text-align: right; width:100%;">' +
        '</div>' +
        '<table class="tight"><tr><td style="padding-right:5px;"><textarea id="ticket-reply-input" class="ticket-reply-text" style="width:100%;"></textarea></td>' +
        '<td><textarea id="ticket-reply-last-question" class="ticket-reply-text" style="display:none;" readonly></textarea></td></tr></table>'+
        '<br />' +
        '<input type="hidden" id="ticket-reply-input-resource" value="" />' +
        '</fieldset></td></tr>' +
        '<tr><td><fieldset class="lzm-fieldset" data-role="none"><legend>' + t('Closing Phrase') + '</legend>' +
        '<div class="tr-salutation-fields' + disabledString2 + '">';
    checkedString = (salutationFields['closing phrase'][0]) ? ' checked="checked"' : '';
    disabledString = (salutationFields['closing phrase'][0]) ? '' : ' class="ui-disabled"';
    replyString += '<span id="tr-close-placeholder"' + disabledString + '></span>' +
        '<input type="checkbox" id="use-tr-close" class="checkbox-custom" data-role="none"' + checkedString + ' />' +
        '<label for="use-tr-close" class="checkbox-custom-label"></label>' +
        '</fieldset></td></tr>';
    replyString += '<tr><td><fieldset class="lzm-fieldset" data-role="none"><legend>' + t('Signature') + '</legend><div id="message-signature-container" class="' + disabledString2 + '" style="margin: 0px; width:100%;">' +
        '<select id="ticket-reply-signature" data-role="none" class="lzm-select" style="margin-bottom: 5px;">';
    var chosenPriority = -1;

    for (i=0; i<signatures.length; i++)
    {
        var defaultString = (signatures[i].d == 1) ? t('(Default)') : '';
        var nameString = signatures[i].n + ' ' + defaultString;
        var selectedString = '';
        if (signatures[i].priority > chosenPriority) {
            selectedString = ' selected="selected"';
            signatureText = signatures[i].text;
            chosenPriority = signatures[i].priority;
        }
        replyString += '<option value="' + signatures[i].text + '"' + selectedString + '>' + nameString + '</option>';
    }
    replyString += '</select><br />';
    disabledString = (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'change_signature', {})) ? '' : ' ui-disabled"';
    replyString += '<textarea id="ticket-reply-signature-text" class="ticket-reply-text' + disabledString + '">' + signatureText + '</textarea>';
    replyString += '</div></fieldset></td></tr></table>';

    var attachmentsHtml = '<div data-role="none" id="message-attachment-list">' + that.createTicketAttachmentTable(ticket, {id: ''}, -1, true) + '</div>';
    var bodyString = '<div id="reply-placeholder"></div>';
    var headerString = t('Compose Response');

    var footerString = '<span style="float:right;">' + lzm_inputControls.createButton('ticket-reply-preview', '', '', t('Preview'), '', 'lr', {'margin-left': '6px', 'margin-top': '-2px'}, '', 20, 'd') + lzm_inputControls.createButton('ticket-reply-cancel', '', 'cancelTicketReply(\'' + ticket.id + '\',\'ticket-details\', \'' + lzm_chatDisplay.ticketDialogId[ticket.id] + '\');', t('Cancel'), '', 'lr',{'margin-left': '6px', 'margin-top': '-2px'}, '', 20, 'd')+
    '</span><span style="float:left;">' + lzm_inputControls.createButton('ticket-reply-pause', '', 'pauseTicketReply(\'' + ticket.id + '\',\'ticket-details\', \'' + lzm_chatDisplay.ticketDialogId[ticket.id] + '\');', tid('ticket'), '<i class="fa fa-backward"></i>', 'lr',{'margin-left': '6px', 'margin-top': '-2px'}, '', 20, 'e')+'</span>';
    lzm_displayHelper.minimizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id], 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);

    var myDialogId = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'ticket-details', {}, {}, {}, {}, '',{'ticket-id': ticket.id, menu: menuEntry}, true, true, rDiaId);
    lzm_displayHelper.createTabControl('reply-placeholder', [{name: t('Composer'), content: replyString},{name: t('Attachments'), content: attachmentsHtml}], 0);

    $('#message-comment-text').css({'min-height': ($('#ticket-details-body').height() - 62) + 'px'});
    $('#message-attachment-list').css({'min-height': ($('#ticket-details-body').height() - 62) + 'px'});

    lzm_inputControls.createInputMenu('tr-greet-placeholder', 'tr-greet', 'lzm-combobox-small', 0, t('Salutation'), salutationFields['salutation'][1][0][0],salutationFields['salutation'][1], 'reply-placeholder-content-0', 0);
    lzm_inputControls.createInputMenu('tr-title-placeholder', 'tr-title', 'lzm-combobox-small', 0, t('Title'), salutationFields['title'][1][0][0],salutationFields['title'][1], 'reply-placeholder-content-0', -2);
    lzm_inputControls.createInputMenu('tr-intro-placeholder', 'tr-intro', '', lzm_chatDisplay.FullscreenDialogWindowWidth - 125, t('Introduction Phrase'), salutationFields['introduction phrase'][1][0][0], salutationFields['introduction phrase'][1], 'reply-placeholder-content-0', 2);
    lzm_inputControls.createInputMenu('tr-close-placeholder', 'tr-close', '', lzm_chatDisplay.FullscreenDialogWindowWidth - 125, t('Closing Phrase'), salutationFields['closing phrase'][1][0][0], salutationFields['closing phrase'][1], 'reply-placeholder-content-0', 2);

    var trFields = ['greet', 'title', 'firstname', 'lastname', 'punctuationmark', 'intro', 'close'];
    for (i=0; i<trFields.length; i++)
        $('#use-tr-' + trFields[i]).change(function() {
            var inputId = $(this).attr('id').replace(/use-/,'');
            if ($('#use-' + inputId).attr('checked') == 'checked') {
                $('#' + inputId + '-placeholder').removeClass('ui-disabled');
                $('#' + inputId).removeClass('ui-disabled');
            } else {
                $('#' + inputId + '-placeholder').addClass('ui-disabled');
                $('#' + inputId).addClass('ui-disabled');
            }
        });

    $('#enable-tr-salutation').click(function() {
        if ($('#enable-tr-salutation').prop('checked')) {
            $('.tr-salutation-fields').removeClass('ui-disabled');
        } else {
            $('.tr-salutation-fields').addClass('ui-disabled');
        }
    });
    $('#reply-placeholder-tab-2').click(function() {
        UIRenderer.resizeTicketReply();
    });
    $('#add-attachment').click(function(){
        if ((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        {
            lzm_displayHelper.minimizeDialogWindow(myDialogId, 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);
            UserActions.addQrd(3,'', true, myDialogId, null, menuEntry);
        }
        else
            showNotMobileMessage();
    });
    $('#add-attachment-from-qrd').click(function() {
        lzm_displayHelper.minimizeDialogWindow(myDialogId, 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);
        var fileResources = DataEngine.cannedResources.getResourceList('ti', {ty: '0,3,4'});
        lzm_chatDisplay.resourcesDisplay.createQrdTreeDialog(fileResources, 'ATTACHMENT~' + myDialogId, menuEntry);
    });
    $('#remove-attachment').click(function() {
        var resources = $('#reply-placeholder-content-1').data('selected-resources');
        resources = (typeof resources != 'undefined') ? resources : [];
        var tmpResources = [];
        for (var i=0; i<resources.length; i++) {
            if (i != $('#attachment-table').data('selected-attachment')) {
                tmpResources.push(resources[i]);
            }
        }
        $('#reply-placeholder-content-1').data('selected-resources', tmpResources);
        that.updateAttachmentList();
        $('#attachment-table').data('selected-attachment', -1);
        $('#remove-attachment').addClass('ui-disabled');
    });
    $('#ticket-reply-input-load').click(function() {
        lzm_displayHelper.minimizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply', 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);
        lzm_chatDisplay.resourcesDisplay.createQrdTreeDialog(null, 'TICKET LOAD' + '~' + ticket.id, menuEntry);
    });
    $('#ticket-reply-input-save').click(function() {
        if ($('#ticket-reply-input-resource').val() != '') {
            var resourceText = $('#ticket-reply-input').val();
            var resourceId = $('#ticket-reply-input-resource').val();
            saveQrdFromTicket(resourceId, resourceText);
        }
    });
    $('#ticket-reply-input-saveas').click(function() {
        if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
        {
            showNotMobileMessage();
        }
        else
        {
            lzm_chatDisplay.ticketResourceText[ticket.id] = $('#ticket-reply-input').val().replace(/\n/g, '<br />');
            lzm_displayHelper.minimizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply', 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);
            var textResources = DataEngine.cannedResources.getResourceList('ti', {ty: '0,1'});
            lzm_chatDisplay.resourcesDisplay.createQrdTreeDialog(textResources, 'TICKET SAVE' + '~' + ticket.id, menuEntry);
        }
    });
    $('#ticket-reply-input-clear').click(function() {
        $('#ticket-reply-input').val('');
        $('#ticket-reply-reply-inline').removeClass('ui-disabled');
        answerInline = false;
    });
    $('#ticket-reply-show-question').click(function() {
        var show = $('#ticket-reply-last-question').css('display') == 'none';
        if (show) {
            var lastMessageText = (ticket.messages[messageNo].mt);
            $('#ticket-reply-last-question').text(lastMessageText).css({display: 'block'});
            $('#ticket-reply-show-question').html((($(window).width()<500) ? '<i class="fa fa-question"></i>': t('Hide Question')));
        } else {
            $('#ticket-reply-input').parent().css({display: 'block'});
            $('#ticket-reply-last-question').text('').css({display: 'none'});
            $('#ticket-reply-show-question').html((($(window).width()<500) ? '<i class="fa fa-question"></i>': t('Show Question')));
        }
        lzm_commonStorage.saveValue('ticket_reply_show_question_' + DataEngine.myId, (show)?1:0);
        $('#ticket-reply-input').focus();
    });
    $('#ticket-reply-reply-inline').click(function() {
        var lastMessageText = ticket.messages[messageNo].mt.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
            .replace(/\n +/g,'\n').replace(/\n+/g,'\n');
        lastMessageText = '> ' + lastMessageText.replace(/\n/g, '\n> ').replace(/\n/g, '\r\n');
        $('#ticket-reply-reply-inline').addClass('ui-disabled');
        insertAtCursor('ticket-reply-input', lastMessageText);
        answerInline = true;
    });
    $('#ticket-reply-signature').change(function() {
        $('#ticket-reply-signature-text').val($('#ticket-reply-signature').val());
    });
    $('#ticket-reply-preview').click(function() {
        var salutationValues = {
            'enable-salutation': $('#enable-tr-salutation').prop('checked'),
            'salutation': [$('#use-tr-greet').attr('checked') == 'checked', $.trim($('#tr-greet').val())],
            'title': [$('#use-tr-title').attr('checked') == 'checked', $.trim($('#tr-title').val())],
            'introduction phrase': [$('#use-tr-intro').attr('checked') == 'checked', $('#tr-intro').val()],
            'closing phrase': [$('#use-tr-close').attr('checked') == 'checked', $('#tr-close').val()],
            'first name': [$('#use-tr-firstname').attr('checked') == 'checked', $.trim($('#tr-firstname').val())],
            'last name': [$('#use-tr-lastname').attr('checked') == 'checked', $.trim($('#tr-lastname').val())],
            'punctuation mark': [true, $('#tr-punctuationmark').val()]
        };
        var replyText = $('#ticket-reply-input').val();
        var commentText = "";
        var signatureText =  $('#ticket-reply-signature-text').val();
        var thisMessageNo = (!answerInline || true) ? messageNo : -1;
        var resources = $('#reply-placeholder-content-1').data('selected-resources');
        resources = (typeof resources != 'undefined') ? resources : [];
        that.showMessageReplyPreview(ticket, thisMessageNo, replyText, signatureText, commentText, resources,salutationValues, selectedGroup, menuEntry, answerInline);
    });
    $('#use-tr-intro').change(function() {
        $('#tr-intro-select').css('display','none');
    });
    $('#use-tr-close').change(function() {
        $('#tr-close-select').css('display','none');
    });

    $('#reply-placeholder').on({
        dragstart: function(){
            ChatTicketClass.m_BlockReplyDrop = true;
        },
        dragenter: function() {
            if(!ChatTicketClass.m_BlockReplyDrop)
            {
                $('#reply-placeholder-tab-1').click();
                $('#add-attachment').click();
            }
        },
        dragend: function(){
            ChatTicketClass.m_BlockReplyDrop = false;
        }
    });

    if(lzm_commonStorage.loadValue('ticket_reply_show_question_' + DataEngine.myId)==1)
        $('#ticket-reply-show-question').click();

    UIRenderer.resizeTicketReply();
};

ChatTicketClass.prototype.createWatchListTable = function(){
    var wlHtml = '<table id="watch-list-table" class="visible-list-table alternating-rows-table lzm-unselectable"><thead><tr><th>' + tid('operator') + '</th></tr></thead><tbody>';
    var operators = DataEngine.operators.getOperatorList('name', '', true);
    for (i=0; i<operators.length; i++)
        if (operators[i].isbot != 1)
            wlHtml += '<tr><td>' + lzm_inputControls.createCheckbox('wlcb'+operators[i].id,operators[i].name,false,'') + '</td></tr>';
    return wlHtml + '</tbody></table>';
};

ChatTicketClass.prototype.showMessageReplyPreview = function(ticket, messageNo, message, signature, comment, attachments, salutation, group, menuEntry, answerInline) {
    menuEntry = (typeof menuEntry != 'undefined') ? menuEntry : '';

    var replacementArray,messageId = md5(Math.random().toString());
    var email = '', bcc = '', cc='',i, subjObject = {}, defLanguage = 'EN';

    var groupName = (typeof group.humanReadableDescription[ticket.l.toLowerCase()] != 'undefined') ?
        group.humanReadableDescription[ticket.l.toLowerCase()] :
        (typeof group.humanReadableDescription[DataEngine.defaultLanguage] != 'undefined') ?
            group.humanReadableDescription[DataEngine.defaultLanguage] : group.id;

    for (i=0; i<group.pm.length; i++)
    {
        subjObject[group.pm[i].lang] = (group.pm[i].str != '') ? group.pm[i].str : group.pm[i].st;
        if (group.pm[i].def == 1)
            defLanguage = group.pm[i].lang;
    }

    var previousMessageSubject = '';
    var subject = '';

    if(ticket != null && d(ticket.messages) && ticket.messages.length && ticket.messages[0].s.length)
    {
        previousMessageSubject =
        subject = ticket.messages[0].s;
    }
    else if(d(subjObject[defLanguage]))
        subject = subjObject[defLanguage];

    var subjectHash = '[' + ticket.h + ']';

    if(subject.indexOf('%ticket_hash%') == -1 && subject.indexOf(subjectHash) == -1)
        subject = subjectHash + ' ' + subject;

    replacementArray = [
        {pl: '%ticket_hash%', rep: subjectHash}, {pl: '%website_name%', rep: DataEngine.siteName},
        {pl: '%subject%', rep: previousMessageSubject},{pl: '%ticket_id%', rep: ticket.id},
        {pl: '%operator_name%', rep: lzm_chatDisplay.myName},
        {pl: '%operator_id%', rep: lzm_chatDisplay.myLoginId}, {pl: '%operator_email%', rep: lzm_chatDisplay.myEmail},
        {pl: '%external_name%', rep: ''}, {pl: '%external_email%', rep: ''}, {pl: '%external_company%', rep: ''},
        {pl: '%external_phone%', rep: ''}, {pl: '%external_ip%', rep: ''}, {pl: '%page_title%', rep: ''}, {pl: '%url%', rep: ''},
        {pl: '%searchstring%', rep: ''}, {pl: '%localtime%', rep: ''},  {pl: '%domain%', rep: ''}, {pl: '%localdate%', rep: ''}, {pl: '%mailtext%', rep: ''},
        {pl: '%group_id%', rep: groupName}];

    subject = lzm_commonTools.replacePlaceholders('Re: ' + subject, replacementArray);
    subject = subject.replace(/[ -]+$/, '');

    var previousMessageId = (messageNo >= 0) ? ticket.messages[messageNo].id : ticket.messages[0].id;
    var trFields = ['salutation', 'title', 'first name', 'last name', 'punctuation mark', 'introduction phrase'];
    var replyText = '';
    if (salutation['enable-salutation']) {
        for (i=0; i<trFields.length; i++) {
            if (salutation[trFields[i]][0])
            {
                var lineBreak = ' ';
                if ((trFields[i] == 'punctuation mark' && salutation[trFields[i]][1] != '') ||
                    trFields[i] == 'introduction phrase' ||
                    (trFields[i] == 'last name' && !salutation['punctuation mark'][0])) {
                    lineBreak = '\n\n';
                }
                else if ((trFields[i] == 'first name' && salutation['first name'][1] == '') ||
                    (trFields[i] == 'first name' && !salutation['last name'][0]) ||
                    (trFields[i] == 'first name' && salutation['last name'][1] == '') ||
                    trFields[i] == 'last name' ||
                    (trFields[i] == 'salutation' && (!salutation['title'][0] || salutation['title'][1] == '') &&
                        (!salutation['first name'][0] || salutation['first name'][1] == '') &&
                        (!salutation['last name'][0] || salutation['last name'][1] == ''))) {
                    lineBreak = '';
                }
                replyText += salutation[trFields[i]][1] + lineBreak;
            }
        }
    }
    replyText = replyText.replace(/ ,\r\n/, ',\r\n');
    replyText += message + '\r\n\r\n';
    if (salutation['enable-salutation'] && salutation['closing phrase'][0])
        replyText += salutation['closing phrase'][1];

    replacementArray = [{pl: '%operator_name%', rep: lzm_chatDisplay.myName}, {pl: '%operator_id%', rep: lzm_chatDisplay.myLoginId},{pl: '%operator_email%', rep: lzm_chatDisplay.myEmail}, {pl: '%group_id%', rep: groupName}];
    signature = lzm_commonTools.replacePlaceholders(signature, replacementArray);
    signature = signature.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/ +\n/, '\n').replace(/^\n+/, '');
    var completeMessage = replyText.replace(/^(\r\n)*/, '').replace(/(\r\n)*$/, '');

    if (ticket.t != 6 && ticket.t != 7)
        completeMessage += (true || signature.indexOf('--') == 0) ? '\r\n\r\n\r\n' + signature : '\r\n\r\n\r\n--\r\n\r\n' + signature;

    for (i=0; i<ticket.messages.length; i++)
    {
        if (ticket.messages[i].em != '' && (i==messageNo || (d(ticket.messages[messageNo]) && ticket.messages[messageNo].t == '1')))
        {
            var emArray = ticket.messages[i].em.split(',');
            email = emArray.splice(0,1);
            bcc = emArray.join(',').replace(/^ +/, '').replace(/ +$/, '');
        }
    }

    var disabledClass = (ticket.t == 6 || ticket.t == 7) ? ' class="ui-disabled"' : '';
    var previewHtml = '<div id="ticket-reply-cell" class="lzm-fieldset">' +
        '<table class="tight">' +
        '<tr><td><label for="ticket-reply-receiver">' + t('Receiver:') + '</label></td><td><input type="text" id="ticket-reply-receiver" value="' + email + '" data-role="none"' + disabledClass + ' /></td></tr>' +
        '<tr><td><label for="ticket-reply-bcc">CC:</label></td><td><input type="text" id="ticket-reply-cc" value="' + cc + '" data-role="none" /></td></tr>' +
        '<tr><td><label for="ticket-reply-bcc">BCC:</label></td><td><input type="text" id="ticket-reply-bcc" value="' + bcc + '" data-role="none" /></td></tr>';

    if (ticket.t != 6 && ticket.t != 7)
        previewHtml += '<tr><td><label for="ticket-reply-subject">' + tidc('subject') + '</label></td><td><input type="text" id="ticket-reply-subject" value="' + subject + '" data-role="none" /></td></tr>';
    else
        previewHtml += '<tr><td><input type="hidden" id="ticket-reply-subject" value="' + subject + '" data-role="none" /></td><td></td></tr>';

    previewHtml += '</table>';
    previewHtml += '<textarea id="ticket-reply-text" class="ticket-reply-text" style="width:100%;" readonly>' + lzm_commonTools.htmlEntities(completeMessage) + '</textarea>';
    previewHtml += '<div class="top-space"><label>'+tidc('comment')+'</label><textarea data-role="none" id="new-message-comment" style="height:100%;width:100%">' + comment + '</textarea></div>';

    if (attachments.length > 0)
    {
        previewHtml += '<label class="top-space" for="ticket-reply-files">' + t('Files:') + '</label>' +
            '<div id="ticket-reply-files" class="ticket-reply-text input-like">';
        for (var m=0; m<attachments.length; m++)
        {
            var downloadUrl = getQrdDownloadUrl(attachments[m]);
            previewHtml += '<span style="margin-right: 10px;">' +
                '<a href="#" onclick="downloadFile(\'' + downloadUrl + '\');" class="lz_chat_file">' + attachments[m].ti + '</a>' +
                '</span>&#8203;'
        }
        previewHtml += '</div>';
    }
    previewHtml += '</div>';

    var watchListHtml = this.createWatchListTable();
    var footerString = lzm_inputControls.createButton('ticket-reply-send', '', '', t('Save and send message'), '<i class="fa fa-envelope-o"></i>', 'lr',{'margin': '-5px 7px'},'',30,'d') +
        lzm_inputControls.createButton('ticket-reply-cancel', '', '', t('Cancel'), '', 'lr',{'margin': '0px'},'',30,'d');
    var bodyString = '<div id="preview-placeholder"></div>';
    lzm_displayHelper.minimizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply', 'ticket-details',{'ticket-id': ticket.id, menu: menuEntry}, 'tickets', false);
    lzm_displayHelper.createDialogWindow(t('Preview'), bodyString, footerString, 'ticket-details', {}, {}, {}, {}, '',{'ticket-id': ticket.id, menu: menuEntry}, true, true, lzm_chatDisplay.ticketDialogId[ticket.id] + '_preview');
    lzm_displayHelper.createTabControl('preview-placeholder', [{name: t('Preview'), content: previewHtml},{name: tid('watch_list'), content: watchListHtml}], 0);
    $('.preview-placeholder-content').css({height: ($('#ticket-details-body').height() - 24) + 'px'});
    $('#ticket-reply-cancel').click(function() {
        lzm_displayHelper.removeDialogWindow('ticket-details');
        lzm_displayHelper.maximizeDialogWindow(lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply');
    });
    $('#ticket-reply-send').click(function() {

        var replyReceiver = $('#ticket-reply-receiver').val();
        var messageIncludingReceiver = replyReceiver + ' ' + completeMessage;
        var messageLength = messageIncludingReceiver.replace(/\r\n/g, '\n').length, errorMessage = '';
        if (ticket.t != 7 || messageLength < 140) {
            if (replyReceiver != '')
            {
                if (salutation['enable-salutation'])
                {
                    delete salutation['enable-salutation'];
                    lzm_commonTools.saveTicketSalutations(salutation, ticket.l.toLowerCase());
                }
                var messageSubject = $('#ticket-reply-subject').val();

                var addToWL = [];
                $('#watch-list-table input').each(function() {
                    if($(this).attr('checked')=='checked')
                        addToWL.push($(this).attr('id').substr(4,$(this).attr('id').length-4));
                });

                sendTicketMessage(ticket, replyReceiver, $('#ticket-reply-cc').val(), $('#ticket-reply-bcc').val(), messageSubject, completeMessage, $('#new-message-comment').val(), attachments, messageId, previousMessageId, addToWL);

                lzm_displayHelper.removeDialogWindow('ticket-details');
                delete lzm_chatDisplay.StoredDialogs[lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply'];
                delete lzm_chatDisplay.StoredDialogs[lzm_chatDisplay.ticketDialogId[ticket.id]];
                var tmpStoredDialogIds = [];
                for (var j=0; j<lzm_chatDisplay.StoredDialogIds.length; j++) {
                    if (lzm_chatDisplay.ticketDialogId[ticket.id] != lzm_chatDisplay.StoredDialogIds[j] &&
                        lzm_chatDisplay.ticketDialogId[ticket.id] + '_reply' != lzm_chatDisplay.StoredDialogIds[j]) {
                        tmpStoredDialogIds.push(lzm_chatDisplay.StoredDialogIds[j])
                    }
                }
                lzm_chatDisplay.StoredDialogIds = tmpStoredDialogIds;
            }
            else
            {
                errorMessage = t('Please enter a valid email address.');
                lzm_commonDialog.createAlertDialog(errorMessage, [{id: 'ok', name: t('Ok')}]);
                $('#alert-btn-ok').click(function() {
                    lzm_commonDialog.removeAlertDialog();
                });
            }
        }
        else
        {
            errorMessage = t('A twitter message may only be 140 characters long. Your message is <!--message_length--> characters long.',[['<!--message_length-->', messageLength]]);
            lzm_commonDialog.createAlertDialog(errorMessage, [{id: 'ok', name: t('Ok')}]);
            $('#alert-btn-ok').click(function() {
                lzm_commonDialog.removeAlertDialog();
                $('#ticket-reply-cancel').click();
            });
        }
    });
    UIRenderer.resizeTicketReply();
};

ChatTicketClass.prototype.showMessageForward = function(message, ticketId, ticketSender, group) {

    var menuEntry = t('Ticket (<!--ticket_id-->, <!--name-->)',[['<!--ticket_id-->', ticketId],['<!--name-->', ticketSender]]);
    var headerString = t('Send to');
    var footerString = lzm_inputControls.createButton('send-forward-message', '','', t('Ok'), '', 'lr',{'margin-left': '6px'},'',30,'d') +
        lzm_inputControls.createButton('cancel-forward-message', '','', t('Cancel'), '', 'lr',{'margin-left': '6px'},'',30,'d');
    var bodyString = '<div id="message-forward-placeholder"></div>';
    var messageTime = lzm_chatTimeStamp.getLocalTimeObject(message.ct * 1000, true);
    var timeHuman = lzm_commonTools.getHumanDate(messageTime, 'all', lzm_chatDisplay.userLanguage);
    var myGroup = DataEngine.groups.getGroup(group), sender = '', receiver = '';
    if ($.inArray(parseInt(message.t), [0, 3, 4]) != -1) {
        sender = lzm_commonTools.htmlEntities(message.em);
        receiver = (myGroup != null) ? myGroup.email : group;
    } else if (message.t == 1) {
        sender = (myGroup != null) ? myGroup.email : group;
        receiver = lzm_commonTools.htmlEntities(message.em);
    }
    var emailText = t('-------- Original Message --------') +
        '\n' + t('Subject: <!--subject-->', [['<!--subject-->', lzm_commonTools.htmlEntities(message.s)]]) +
        '\n' + t('Date: <!--date-->', [['<!--date-->', timeHuman]]);
    if ($.inArray(parseInt(message.t), [0, 1, 3, 4]) != -1) {
        emailText += '\n' + t('From: <!--sender_email-->', [['<!--sender_email-->', sender]]) +
            '\n' + t('To: <!--receiver-->', [['<!--receiver-->', receiver]]);
    }
    emailText += '\n\n\n' +
        lzm_commonTools.htmlEntities(message.mt);
    var emailHtml = '<div id="message-forward" class="lzm-fieldset" data-role="none"><div><label for="forward-email-addresses">' + t('Email addresses: (separate by comma)') + '</label>' +
        '<input type="text" data-role="none" id="forward-email-addresses" value="' + lzm_commonTools.htmlEntities(message.em) + '" /></div>' +
        '<div class="top-space"><label for="forward-subject">' + tidc('subject') + '</label>' +
        '<input type="text" data-role="none" id="forward-subject" value="' + lzm_commonTools.htmlEntities(message.s) + '"/></div>' +
        '<div class="top-space"><label for="forward-text">' + t('Email Body:') + '</label>' +
        '<textarea id="forward-text" data-role="none">' + emailText + '</textarea></div>';
    if (message.attachment.length > 0) {
        emailHtml += '<br /><label for="ticket-reply-files">' + t('Files:') + '</label>' +
            '<div id="forward-files" class="ticket-reply-text input-like">';
        for (var m=0; m<message.attachment.length; m++) {
            var attachment = {ti: message.attachment[m].n, rid: message.attachment[m].id};
            var downloadUrl = getQrdDownloadUrl(attachment);
            emailHtml += '<span style="margin-right: 10px;">' +
                '<a href="#" onclick="downloadFile(\'' + downloadUrl + '\');" class="lz_chat_file">' + attachment.ti + '</a>' +
                '</span>&#8203;'
        }
        emailHtml += '</div>';
    }
    emailHtml += '</div>';

    var dialogData = {'ticket-id': ticketId, menu: menuEntry};
    var ticketDialogId = lzm_chatDisplay.ticketDialogId[ticketId];
    lzm_displayHelper.minimizeDialogWindow(ticketDialogId, 'ticket-details', dialogData, 'tickets', false);
    lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'ticket-details', {}, {}, {}, {}, '',
        dialogData, true, true, ticketDialogId + '_forward');
    lzm_displayHelper.createTabControl('message-forward-placeholder', [{name: t('Email'), content: emailHtml}]);
    UIRenderer.resizeMessageForwardDialog();

    $('#cancel-forward-message').click(function() {
        lzm_displayHelper.removeDialogWindow('ticket-details');
        lzm_displayHelper.maximizeDialogWindow(ticketDialogId);
    });
    $('#send-forward-message').click(function() {
        sendForwardedMessage(message, $('#forward-text').val(), $('#forward-email-addresses').val(), $('#forward-subject').val(), ticketId, group);
        $('#cancel-forward-message').click();
    });
};

ChatTicketClass.prototype.addMessageComment = function(ticketId, message, menuEntry) {

    var that = this;
    var commentControl = lzm_inputControls.createArea('new-comment-field', '', '', tid('comment') + ':','width:300px;height:75px;');
    lzm_commonDialog.createAlertDialog(commentControl, [{id: 'ok', name: tid('ok')},{id: 'cancel', name: tid('cancel')}],false,true,false);
    $('#new-comment-field').select();
    $('#alert-btn-ok').click(function() {
        var commentText = $('#new-comment-field').val();
        if (typeof ticketId != 'undefined' && typeof message.id != 'undefined')
        {
            UserActions.saveTicketComment(ticketId, message.id, commentText);
        }
        else
        {
            var comments = $('#ticket-details-placeholder-content-2').data('comments');
            comments = (typeof comments != 'undefined') ? comments : [];
            comments.push({text: commentText, timestamp: lzm_chatTimeStamp.getServerTimeString(null, false, 1)});
            $('#ticket-details-placeholder-content-2').data('comments', comments);
            that.updateCommentList();
        }
        lzm_commonDialog.removeAlertDialog();
    });
    $('#alert-btn-cancel').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
};

ChatTicketClass.prototype.createTicketMessageTable = function(ticket, email, messageNumber, isNew, chat) {
    var that = this;
    var messageTableHtml = '<table id="ticket-history-table" class="visible-list-table alternating-rows-table lzm-unselectable" data-selected-message="' + messageNumber + '">';
    if (!isNew)
        messageTableHtml += that.createTicketMessageList(ticket);
    else if (chat.cid != '')
        messageTableHtml += that.createTicketMessageList({id: ''});

    messageTableHtml += '</table>';
    return messageTableHtml;
};

ChatTicketClass.prototype.getDirectionImage = function(directionOnly,message,style){
    var directionImage = '';
    if(!directionOnly)
    {
        if (message.t == 1)
            directionImage = '<i '+style+' class="fa fa-arrow-circle-left icon-green"></i>';
        else if (message.t == 2)
            directionImage = '';
        else if (message.t == 3)
            directionImage = '<i '+style+' class="fa fa-arrow-circle-right icon-blue"></i>';
        else
            directionImage = '<i '+style+' class="fa fa-home icon-blue"></i>';
    }
    else
    {
        if (message.t == 1)
            directionImage = '<i '+style+' class="fa fa-arrow-circle-left icon-light"></i>';
        else
            directionImage = '<i '+style+' class="fa fa-arrow-circle-right icon-orange"></i>';
    }

    return directionImage;
};

ChatTicketClass.prototype.createTicketMessageList = function (ticket) {

    var that = this, operator, key;
    var fullScreenMode = this.isFullscreenMode();
    var messageListHtml = '<thead><tr id="ticket-history-header-line">';

    if(fullScreenMode)
    {
        messageListHtml += '<th colspan="5">'+lzm_inputControls.createCheckbox('ticket-history-show-messages',tid('messages'),true,'','display:inline;');
        messageListHtml += lzm_inputControls.createCheckbox('ticket-history-show-comments',tid('comments'),true,'','display:inline;padding-left:5px;');
        messageListHtml += lzm_inputControls.createCheckbox('ticket-history-show-logs','Logs',false,'','display:inline;padding-left:5px;')+'</th>';
    }
    messageListHtml += '</tr></thead><tbody>';

    if(d(ticket.messages) && ticket.messages.length)
    {
        ticket.messages.sort(that.ticketMessageSortfunction);
        var logsProcessed = ticket.logs.length-1;
        for (var i=ticket.messages.length - 1; i>=0; i--) {

            var linecol = (i%2!=0) ? '#fff' : '#f8f8ff';
            operator = DataEngine.operators.getOperator(ticket.messages[i].sid);
            var messageTimeObject = lzm_chatTimeStamp.getLocalTimeObject(ticket.messages[i].ct * 1000, true);
            var messageTimeHuman = lzm_commonTools.getHumanDate(messageTimeObject, '', lzm_chatDisplay.userLanguage);
            var customerName = '';

            if (ticket.messages[i].fn != '')
                customerName += lzm_commonTools.htmlEntities(ticket.messages[i].fn);
            else if (ticket.messages[i].em != '')
                customerName += lzm_commonTools.htmlEntities(ticket.messages[i].em);

            var sender = (ticket.messages[i].t == 1 && operator != null) ? operator.name : customerName;
            var messageTypeImage = '<i class="fa fa-envelope"></i>';
            var directionStyle = 'style="margin:0 2px;font-size:16px;"';

            var directionImage = this.getDirectionImage(false,ticket.messages[i],directionStyle);

            if (ticket.messages[i].t == 1)
            {
                if (ticket.t == 6)
                    messageTypeImage = '<i '+directionStyle+' class="fa fa-facebook icon-blue"></i>';
                else if (ticket.t == 7)
                    messageTypeImage = '<i '+directionStyle+' class="fa fa-twitter icon-blue"></i>';
                else
                    messageTypeImage = '<i '+directionStyle+' class="fa fa-envelope"></i>';

            }
            else if (ticket.messages[i].t == 2)
            {
                messageTypeImage = '<i '+directionStyle+' class="fa fa-comment icon-light"></i>';
            }
            else if (ticket.messages[i].t == 3)
            {
                if (ticket.t == 6)
                    messageTypeImage = '<i '+directionStyle+' class="fa fa-facebook icon-blue"></i>';
                else if (ticket.t == 7)
                    messageTypeImage = '<i '+directionStyle+' class="fa fa-twitter icon-blue"></i>';
                else
                    messageTypeImage = '<i '+directionStyle+' class="fa fa-envelope"></i>';
            }
            else if (ticket.messages[i].t == 4)
                messageTypeImage = '<i '+directionStyle+' class="fa fa-envelope"></i>';

            var onclickAction = '', oncontextMenu = '', ondblclickAction = '';

            if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
            {
                oncontextMenu = ' oncontextmenu="openTicketMessageContextMenu(event, \'' + ticket.id + '\', \'' + i + '\', false);"';
                ondblclickAction = ' ondblclick="toggleMessageEditMode(\'' + ticket.id + '\', \'' + i + '\');"';
            }

            var attachmentImage = (ticket.messages[i].attachment.length > 0) ? '<i class="fa fa-paperclip"></i>' : '';
            var nextTicket = ((i-1) > 0) ? ticket.messages[i-1] : null;

            if(!fullScreenMode)
            {
                onclickAction = ' onclick="selectTicketMessage(\'' + ticket.id + '\', \'' + i + '\');setTimeout(function(){handleTicketMessageClick(\'' + ticket.id + '\', \'' + i + '\');},100);"';
                messageListHtml += '<tr class="message-line lzm-unselectable" id="message-line-' + ticket.id + '_' + i + '" style="cursor: pointer;"' + onclickAction + oncontextMenu + ondblclickAction + '>' +
                    '<td class="icon-column">' + directionImage + '</td>' +
                    '<td class="icon-column">' + messageTypeImage + '</td>';

                var svContent = lzm_commonTools.htmlEntities(ticket.messages[i].fn);
                svContent += '<div>' + lzm_commonTools.htmlEntities(ticket.messages[i].s) + '</div>';
                svContent += '<div class="lzm-info-text">' + lzm_commonTools.htmlEntities(lzm_commonTools.SubStr(ticket.messages[i].mt,200,true)) + '</div>';
                svContent = svContent.replace(/\n/g, " ").replace(/\r/g, " ").replace(/<br>/g, " ");
                messageListHtml += '<td class="ticket-simple-cell">' + svContent + '</td></tr>';
            }
            else
            {
                onclickAction = ' onclick="handleTicketMessageClick(\'' + ticket.id + '\', \'' + i + '\');"';
                for(key=logsProcessed;key >=0;key--)
                {
                    var log = ticket.logs[key];
                    if(log.ti > ticket.messages[i].ct || nextTicket == null){
                        messageListHtml += this.createTicketMessageAddLine('log',key,i,ticket,log,'#f6f6f6');
                        logsProcessed = key-1;
                    }
                }


                var avfield = (ticket.messages[i].t != 1 || ticket.messages[i].sid=='') ? lzm_inputControls.createAvatarField('',ticket.messages[i].fn,'') : lzm_inputControls.createAvatarField('','',ticket.messages[i].sid);

                messageListHtml += '<tr class="message-line message-line-fs lzm-unselectable" id="message-line-' + ticket.id + '_' + i + '"' +
                    onclickAction + oncontextMenu + ondblclickAction + '>' +
                    '<td style="background:'+linecol+';">' + avfield +
                    '</td><td colspan="3" style="background:'+linecol+';">' +
                    '<div>' + messageTimeHuman + '</div><b>' + sender + '</b>' +
                    '</td><td style="background:'+linecol+';text-align:right;">' + directionImage +''+ messageTypeImage +''+ attachmentImage +'&nbsp;</td></tr>';

                if(ticket.messages[i].comment.length>0)
                {
                    for(key in ticket.messages[i].comment)
                        messageListHtml += this.createTicketMessageAddLine('comment',key,i,ticket,ticket.messages[i].comment[key],linecol,onclickAction,oncontextMenu);
                    messageListHtml += this.createTicketMessageAddLine('spacer',key,i,ticket,ticket.messages[i].comment[key],linecol);
                }
            }
            messageListHtml += '';
        }
    }
    messageListHtml += '</tbody>';
    return messageListHtml;
};

ChatTicketClass.prototype.createTicketMessageAddLine = function(type,key,mkey,ticket,object,linecol,onclickAction,oncontextAction) {
    var lineHtml = '';
    if(type=="comment")
    {
        var messageTimeObject = lzm_chatTimeStamp.getLocalTimeObject(object.t * 1000, true);
        var messageTimeHuman = lzm_commonTools.getHumanDate(messageTimeObject, '', lzm_chatDisplay.userLanguage);

        var coperator = DataEngine.operators.getOperator(object.o);
        lineHtml += '<tr class="message-line message-comment-line comment-line-' + ticket.id + '_' + mkey + ' lzm-unselectable" id="message-line-comment-' + ticket.id + '_' + key + '" '+onclickAction+oncontextAction+'>' +
            '<td style="background:'+linecol+';"></td>'+
            '<td style="background:'+linecol+';padding:2px !important;" colspan="4">' +
            '<table class="comment-box" style="background:#fff !important;border: 1px solid '+coperator.c+'"><tr><td style="background:#fff !important;color:#666 !important;">' + lzm_inputControls.createAvatarField('avatar-box-small','',coperator.id) + '</td>'+
            '<td style="background:#fff !important;color:#666 !important;"><div class="text-s" style="color:#777 !important;padding-bottom:3px;">'+messageTimeHuman+'</div><span style="background:#fff !important;color:#666 !important;">' + lzm_commonTools.htmlEntities(coperator.name) + ': </span>' + lzm_commonTools.htmlEntities(object.text) + '</td></tr></table>' +
            '</td></tr>';
    }
    else if(type=="log")
    {
        var messageTimeObject = lzm_chatTimeStamp.getLocalTimeObject(object.ti * 1000, true);
        var messageTimeHuman = lzm_commonTools.getHumanDate(messageTimeObject, '', lzm_chatDisplay.userLanguage);
        var loperator = DataEngine.operators.getOperator(object.o);
        var oname = (loperator != null) ? loperator.name : '';
        var toIcon = (object.v != '' && object.vn != '') ? '&nbsp;&nbsp;<i class="fa fa-caret-right icon-small"></i>&nbsp;&nbsp;': '';
        lineHtml += '<tr class="message-line message-log-line lzm-unselectable" id="message-line-log-' + ticket.id + '_' + key + '">' +
            '<td style="background:'+linecol+';border-top:1px solid #fff;border-bottom:1px solid #fff;" colspan="5">' +
            '<div style="padding:5px 10px;margin:0;">'+
            '<span class="text-gray" style="white-space:normal;">' + messageTimeHuman + ' (' + lzm_commonTools.htmlEntities(oname)  + ')<br>' + lzm_commonTools.htmlEntities(object.a) + ' (' + lzm_commonTools.htmlEntities(object.v) + ''+toIcon+'' +lzm_commonTools.htmlEntities(object.vn)+')</span>' +
            '</div></td></tr>';
    }
    else if(type=="spacer")
        lineHtml += '<tr class="message-line message-comment-line comment-line-' + ticket.id + '_' + mkey + '"><td colspan="5" style="background:'+linecol+'"></td></tr>';
    return lineHtml;
};

ChatTicketClass.prototype.createTicketMessageDetails = function(message, email, isNew, chat, edit) {
    chat = (typeof chat != 'undefined') ? chat : {cid: ''};
    var comma,dll,files,myCustomInput,myInputText,myInputField,i,j,myDownloadLink;
    var detailsHtml = '<table id="message-details-inner">';
    if (isNew)
    {
        var newTicketName = '',newTicketEmail = '',newTicketCompany = '',newTicketPhone = '';

        if(email.id != '')
        {
            newTicketName = email.n;
            newTicketEmail = email.e;
            newTicketCompany = '';
            newTicketPhone = '';
        }
        else if(chat.cid != '' && chat.Visitor)
        {
            newTicketName = VisitorManager.GetVisitorName(chat.Visitor);
            newTicketEmail = DataEngine.inputList.getInputValueFromVisitor(112,chat.Visitor);
            newTicketCompany = DataEngine.inputList.getInputValueFromVisitor(113,chat.Visitor);
            newTicketPhone = DataEngine.inputList.getInputValueFromVisitor(116,chat.Visitor);
        }
        else if(d(chat.en))
        {
            newTicketName = chat.en;
            newTicketEmail = chat.em;
            newTicketCompany = chat.co;
            newTicketPhone = chat.cp;
        }


        detailsHtml += '<tr>' +
            '<th>' + t('Name:') + '</th>' +
            '<td><input type="text" id="ticket-new-name" data-role="none" value="' + lzm_commonTools.htmlEntities(newTicketName) + '" /></td>' +
            '</tr><tr><th>' + t('Email:') + '</th>' +
            '<td><input type="text" id="ticket-new-email" data-role="none" value="' + lzm_commonTools.htmlEntities(newTicketEmail) + '" /></td>' +
            '</tr><tr><th>' + t('Company:') + '</th>' +
            '<td><input type="text" id="ticket-new-company" data-role="none" value="' + lzm_commonTools.htmlEntities(newTicketCompany) + '" /></td>' +
            '</tr><tr><th>' + t('Phone:') + '</th>' +
            '<td><input type="text" id="ticket-new-phone" data-role="none" value="' + lzm_commonTools.htmlEntities(newTicketPhone) + '" /></td>' +
            '</tr>';


        var newTicketSubject = '';

        if(typeof email != 'undefined' && typeof email.s != 'undefined' && email.s != '')
            newTicketSubject = email.s;

        if(d(chat) && d(chat.s))
        {
            if(chat.s != '')
                newTicketSubject = lzm_commonTools.SubStr(chat.s,32,true);
            else if(d(chat.Messages) && chat.Messages.length > 1)
                newTicketSubject = lzm_commonTools.SubStr(chat.Messages[1].text,32,true);
        }

        detailsHtml += '<tr>' +
        '<th>' + tidc('subject') + '</th>' +
        '<td><input type="text" id="ticket-new-subject" data-role="none" value="' + lzm_commonTools.htmlEntities(newTicketSubject) + '" /></td>' +
        '</tr>';

        for (i=0; i<DataEngine.inputList.idList.length; i++)
        {
            myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[i]);
            var selectedValue = '';


            if(email.id != '')
            {
                selectedValue = '';
            }
            else if(chat.cid != '' && chat.Visitor)
            {
                selectedValue = DataEngine.inputList.getInputValueFromVisitor(DataEngine.inputList.idList[i],chat.Visitor);
            }
            else if(d(chat.cc) && d(chat.cc[i]))
            {
                selectedValue = chat.cc[i].text;
            }

            if (myCustomInput.type == 'ComboBox')
            {
                myInputField = '<select class="lzm-select" id="ticket-new-cf' + myCustomInput.id + '" data-role="none">';
                for (j=0; j<myCustomInput.value.length; j++)
                {
                    var selectedString = (selectedValue == myCustomInput.value[j]) ? ' selected="selected"' : '';
                    myInputField += '<option value="' + j + '"' + selectedString + '>' + myCustomInput.value[j] + '</option>';
                }
                myInputField +='</select>';
            }
            else if (myCustomInput.type == 'CheckBox')
            {
                var checkedString = (selectedValue.toString() == '1' || selectedValue == tid('yes')) ? ' checked="checked"' : '';
                myInputText = myCustomInput.value;
                myInputField = '<input type="checkbox" class="checkbox-custom" id="ticket-new-cf' + myCustomInput.id + '" data-role="none" style="min-width: 0px; width: auto;" value="' + myInputText + '"' + checkedString + ' /><label for="ticket-new-cf' + myCustomInput.id + '" class="checkbox-custom-label"></label>';
            }
            else
            {
                myInputText = lzm_commonTools.htmlEntities(selectedValue);
                myInputField = '<input type="text" id="ticket-new-cf' + myCustomInput.id + '" data-role="none" value="' + myInputText + '" />';
            }

            if (myCustomInput.active == 1 && parseInt(myCustomInput.id) < 111)
                detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td>' + myInputField + '</td></tr>';
        }
    }
    else if(d(message))
    {
        var operator = DataEngine.operators.getOperator(message.sid);
        if (operator != null)
        {
            detailsHtml += '<tr><th>' + t('Name:') + '</th><td><div class="input-like" id="message-operator-name">' + operator.name + '</div></td></tr>';
            if (!edit)
            {
                detailsHtml += '<tr><th>' + t('Sent to:') + '</th><td><div class="input-like">' + lzm_commonTools.htmlEntities(message.em) + '</div></td></tr>';
            }
            else
            {
                detailsHtml += '<tr><th>' + t('Sent to:') + '</th><td><input type="text" data-role="none"' +
                    ' id="change-message-email" class="lzm-text-input" value="' + message.em + '" />' +
                    '<input type="hidden" id="change-message-name" value="" />' +
                    '<input type="hidden" id="change-message-company" value="" />' +
                    '<input type="hidden" id="change-message-phone" value="" /></td></tr>';
            }
        }
        else
        {
            if (!edit)
            {
                detailsHtml += '<tr><th>' + t('Name:') + '</th><td><div class="input-like" id="saved-message-name" ondblclick="toggleMessageEditMode();">' + lzm_commonTools.htmlEntities(message.fn) + '</div></td></tr>';
                detailsHtml += '<tr><th>' + t('Email:') + '</th><td><div class="input-like" id="saved-message-email" ondblclick="toggleMessageEditMode();">' + lzm_commonTools.htmlEntities(message.em) + '</div></td></tr>';
                detailsHtml += '<tr><th>' + t('Company:') + '</th><td><div class="input-like" id="saved-message-company" ondblclick="toggleMessageEditMode();">' + lzm_commonTools.htmlEntities(message.co) + '</div></td></tr>';
                detailsHtml += '<tr><th>' + t('Phone:') + '</th><td><div class="input-like" id="saved-message-phone" ondblclick="toggleMessageEditMode();">' + lzm_commonTools.htmlEntities(message.p) + '</div></td></tr>';
            }
            else
            {
                detailsHtml += '<tr><th>' + t('Name:') + '</th><td><input type="text" data-role="none" id="change-message-name" class="lzm-text-input" value="' + message.fn + '" /></td></tr>';
                detailsHtml += '<tr><th>' + t('Email:') + '</th><td><input type="text" data-role="none" id="change-message-email" class="lzm-text-input" value="' + message.em + '" /></td></tr>';
                detailsHtml += '<tr><th>' + t('Company:') + '</th><td><input type="text" data-role="none" id="change-message-company" class="lzm-text-input" value="' + message.co + '" /></td></tr>';
                detailsHtml += '<tr><th>' + t('Phone:') + '</th><td><input type="text" data-role="none" id="change-message-phone" class="lzm-text-input" value="' + message.p + '" /></td></tr>';
            }
        }

        var subject = (message.t == 0 && message.s != '') ? '<a onclick="openLink(\'' + message.s + '\');" href="#" class="lz_chat_link_no_icon">' + message.s + '</a>' : lzm_commonTools.htmlEntities(message.s);
        var subjectLabel = (message.t == 0 && message.s != '') ? t('Url:') : tidc('subject');

        if (!edit)
            detailsHtml += '<tr><th>' + subjectLabel + '</th><td><div class="input-like" id="saved-message-subject" ondblclick="toggleMessageEditMode();">' + subject + '</div></td></tr>';
        else
            detailsHtml += '<tr><th>' + subjectLabel + '</th><td><input type="text" data-role="none" id="change-message-subject" class="lzm-text-input" value="' + message.s + '" /></td></tr>';

        for (i=0; i<DataEngine.inputList.idList.length; i++)
        {
            myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[i]);
            myInputText = '';

            var myInputValue = '0';

            if (myCustomInput.active == 1 && message.customInput.length > 0 && $.inArray(message.t, ['0', '2', '4']) != -1)
            {
                for (j=0; j<message.customInput.length; j++)
                {
                    if (message.customInput[j].id == myCustomInput.name)
                    {
                        myInputText = (myCustomInput.type != 'CheckBox') ? lzm_commonTools.htmlEntities(message.customInput[j].text) : (message.customInput[j].text == 1) ? t('Yes') : t('No');
                        if (myCustomInput.type == 'File')
                        {
                            myDownloadLink = comma = '';
                            if(myInputText.indexOf('[') != -1 && myInputText.indexOf(']') != -1)
                                files = myInputText.replace(/]/g,'').split('[');
                            else
                                files = [myInputText.toString()];

                            for(var key in files)
                                for (var k=0; k<message.attachment.length; k++)
                                {
                                    if (message.attachment[k].n == files[key])
                                    {
                                        dll = getQrdDownloadUrl({rid: message.attachment[k].id, ti: message.attachment[k].n});
                                        myDownloadLink += comma + '<a href="#" class="lz_chat_file_no_icon" onclick="downloadFile(\'' + dll + '\')">' + files[key] + '</a>';
                                        comma = ', ';
                                    }
                                }

                            myInputText = (myDownloadLink.length) ? myDownloadLink : myInputText;
                        }
                        myInputValue = message.customInput[j].text;
                    }
                }
                if (myCustomInput.active == 1 && parseInt(myCustomInput.id) < 111)
                {
                    if (!edit)
                        detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><div class="input-like" ondblclick="toggleMessageEditMode();">' + myInputText + '</div></td></tr>';
                    else
                    {
                        if (myCustomInput.type == 'CheckBox')
                        {
                            var inputChecked = (myInputValue == '1') ? ' checked="checked"' : '';
                            detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><input type="checkbox" class="checkbox-custom" data-role="none" id="change-message-custom-' + myCustomInput.id + '" value="1"' + inputChecked +
                                ' style="min-width: 0px; width: initial;" /><label for="change-message-custom-' + myCustomInput.id + '" class="checkbox-custom-label"></label></td></tr>';
                        }
                        else if(myCustomInput.type == 'ComboBox')
                        {
                            detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><select data-role="none" class="lzm-select" id="change-message-custom-' + myCustomInput.id + '">';
                            for (j=0; j<myCustomInput.value.length; j++) {
                                var inputSelected = (myCustomInput.value[j] == myInputValue) ? ' selected="selected"' : '';
                                detailsHtml += '<option' + inputSelected + ' value="' + j + '">' + myCustomInput.value[j] + '</option>';
                            }
                            detailsHtml += '</select></td></tr>';
                        }
                        else if(myCustomInput.type != 'File')
                            detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><input type="text" data-role="none" id="change-message-custom-' + myCustomInput.id + '" class="lzm-text-input" value="' + myInputText + '" /></td></tr>';

                    }
                }
            }
            else if (myCustomInput.active == 1 && message.customInput.length == 0 && $.inArray(message.t, ['0', '2', '4']) != -1)
            {
                if (myCustomInput.active == 1 && parseInt(myCustomInput.id) < 111)
                {
                    if (!edit)
                        detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><div class="input-like" ondblclick="toggleMessageEditMode();">-</div></td></tr>';
                    else
                    {
                        if (myCustomInput.type == 'CheckBox')
                        {
                            detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><input type="checkbox" class="checkbox-custom"  data-role="none" id="change-message-custom-' + myCustomInput.id + '" value="1" /><label for="change-message-custom-' + myCustomInput.id + '" class="checkbox-custom-label"></label></td></tr>';
                        }
                        else if(myCustomInput.type == 'ComboBox')
                        {
                            detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><select data-role="none" class="lzm-select" id="change-message-custom-' + myCustomInput.id + '">';
                            for (j=0; j<myCustomInput.value.length; j++)
                                detailsHtml += '<option value="' + j + '">' + myCustomInput.value[j] + '</option>';
                            detailsHtml += '</select></td></tr>';
                        }
                        else
                        {
                            detailsHtml += '<tr><th>' + myCustomInput.name + ':</th><td><input type="text" data-role="none" id="change-message-custom-' + myCustomInput.id + '" class="lzm-text-input" value="" /></td></tr>';
                        }
                    }
                }
            }
        }
    }
    detailsHtml += '</table>';

    if(message.cmb=='1')
        detailsHtml += lzm_inputControls.createInfoField('fa fa-phone icon-large icon-blue',tid('phone_outbound'),'top-space');

    return detailsHtml;
};

ChatTicketClass.prototype.showTicketLinker = function(firstObject, secondObject, firstType, secondType, inChatDialog, elementId) {
    var that = this;
    var headerString = t('Link with...');
    var footerString =
        lzm_inputControls.createButton('link-ticket-link', 'ui-disabled', '', t('Link'), '', 'lr',{'margin-left': '6px', 'margin-top': '-4px'},'',30,'d') +
        lzm_inputControls.createButton('link-ticket-cancel', '', '', t('Cancel'), '', 'lr',{'margin-left': '6px', 'margin-top': '-4px'},'',30,'d');

    var linkWithLabel = (secondType == 'ticket') ? tidc('ticket_id') : tidc('chat_id');
    var firstObjectId = (firstType == 'ticket' && firstObject != null) ? firstObject.id : '';
    var secondObjectId = (secondType == 'ticket' && secondObject != null) ? secondObject.id : (secondType == 'chat' && secondObject != null) ? secondObject.cid : '';
    var firstDivVisible = (firstObject != null) ? 'visible' : 'hidden';
    var secondDivVisible = (secondObject != null) ? 'visible' : 'hidden';
    var firstInputDisabled = (firstObject != null) ? ' ui-disabled' : '';
    var secondInputDisabled = (secondObject != null) ? ' ui-disabled' : '';
    var fsSearchData = (firstType == 'ticket' && firstObject != null) ? (secondType == 'ticket') ? ' data-search="second~ticket"' : ' data-search="second~chat"' :' data-search="first~ticket"';
    var inputChangeId = (firstObject == null) ? 'first-link-object-id' : (secondObject == null) ? 'second-link-object-id' : '';
    var bodyString = '<div data-role="none"' + fsSearchData + ' data-input="' + inputChangeId + '" class="lzm-fieldset" id="ticket-linker-first" style="height:auto;">' +
        '<label for="first-link-object-id">' + tidc('ticket_id') + '</label>' +
        '<input data-role="none" type="text" class="lzm-text-input' + firstInputDisabled + '" id="first-link-object-id" value="' + firstObjectId + '" />' +
        '<div id="first-link-div" style="visibility: ' + firstDivVisible + '">';

    if (firstType == 'ticket' && firstObject != null)
        bodyString += that.fillLinkData('first', firstObjectId, true);

    bodyString += '</div></div><div data-role="none" class="lzm-fieldset" id="ticket-linker-second" style="margin-top: 10px;height:auto;">' +
    '<label for="second-link-object-id">' + linkWithLabel + '</label>' +
    '<input data-role="none" type="text" class="lzm-text-input' + secondInputDisabled + '" id="second-link-object-id" value="' + secondObjectId + '" />' +
    '<div id="second-link-div" style="visibility: ' + secondDivVisible + '">';

    if (secondType == 'chat' && secondType != null)
        bodyString += lzm_chatDisplay.archiveDisplay.fillLinkData(secondObjectId, true);

    bodyString += '</div></div>';

    var dialogId, menuEntry, dialogData, chatsDialogId, chatsWindowId, chatsDialogData;
    if (firstType == 'ticket' && firstObject != null) {
        dialogId = (typeof lzm_chatDisplay.ticketDialogId[firstObject.id] != 'undefined') ? lzm_chatDisplay.ticketDialogId[firstObject.id] : md5(Math.random().toString());
        var ticketSender = (firstObject.messages[0].fn.length > 20) ? lzm_commonTools.escapeHtml(firstObject.messages[0].fn).substr(0, 17) + '...' :
            lzm_commonTools.escapeHtml(firstObject.messages[0].fn);
        menuEntry = t('Ticket (<!--ticket_id-->, <!--name-->)',[['<!--ticket_id-->', firstObject.id],['<!--name-->', ticketSender]]);
        dialogData = {'ticket-id': firstObject.id, menu: menuEntry};
        lzm_displayHelper.minimizeDialogWindow(dialogId, 'ticket-details', dialogData, 'tickets', false);
        lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'ticket-details', {}, {}, {}, {}, '', dialogData, false, false, dialogId + '_linker');

    } else if (secondType == 'chat' && secondObject != null && !inChatDialog) {
        lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'link-chat-ticket', {}, {}, {}, {}, '', {cid: secondObject.cid, menu: t('Link with Ticket')}, false, false);
    } else if (secondType == 'chat' && secondObject != null) {

        if(d($('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-id'))){
            chatsDialogId = $('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-id');
            chatsWindowId = $('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-window');
            chatsDialogData = $('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-data');
            lzm_displayHelper.minimizeDialogWindow(chatsDialogId, chatsWindowId, chatsDialogData, 'archive', false);
            //chatsDialogData = $.extend({}, chatsDialogData, {ratio: lzm_chatDisplay.DialogBorderRatioInput});
        }

        lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, chatsWindowId, {}, {}, {}, {}, '', chatsDialogData, false, false, chatsDialogId + '_linker');
    }
    UIRenderer.resizeTicketLinker();

    var ticketPollData = null, chatPollData = null, lastTyping = 0, lastSeachId = '', customFilter;
    var handleSearch = function(isSame) {
        if ($('#' + inputChangeId).val() != '' && firstObject == null) {
            if ($('#' + inputChangeId).val().length >= 5 && !isSame) {
                CommunicationEngine.stopPolling();

                customFilter = {};
                customFilter.ticketSort = '';
                customFilter.ticketPage = 1;
                customFilter.ticketQuery = $('#' + inputChangeId).val();
                customFilter.ticketFilterStatus = '0123';
                customFilter.ticketFilterChannel = '01234567';
                customFilter.ticketLimit = 6;
                customFilter.customDemandToken = 'linker';
                CommunicationEngine.customFilters.push(customFilter);
                CommunicationEngine.startPolling();
            }
            $('#link-ticket-link').removeClass('ui-disabled');
            that.fillLinkData('first', $('#' + inputChangeId).val());
        } else if ($('#' + inputChangeId).val() != '') {
            $('#link-ticket-link').removeClass('ui-disabled');
            if (secondType == 'ticket') {
                if ($('#' + inputChangeId).val().length >= 5 && !isSame) {
                    CommunicationEngine.stopPolling();

                    customFilter = {};
                    customFilter.ticketSort = '';
                    customFilter.ticketPage = 1;
                    customFilter.ticketQuery = $('#' + inputChangeId).val();
                    customFilter.ticketFilterStatus = '0123';
                    customFilter.ticketFilterChannel = '01234567';
                    customFilter.ticketLimit = 7;
                    customFilter.customDemandToken = 'linker';
                    CommunicationEngine.customFilters.push(customFilter);
                    CommunicationEngine.startPolling();
                }
                that.fillLinkData('second', $('#' + inputChangeId).val());
            } else {
                if (chatPollData == null) {
                    chatPollData = {p: CommunicationEngine.chatArchivePage, q: CommunicationEngine.chatArchiveQuery, f: CommunicationEngine.chatArchiveFilter,
                        l: CommunicationEngine.chatArchiveLimit, g: CommunicationEngine.chatArchiveFilterGroup, e: CommunicationEngine.chatArchiveFilterExternal,
                        i: CommunicationEngine.chatArchiveFilterInternal};
                    $('#ticket-linker-first').data('chat-poll-data', chatPollData);
                }
                if ($('#' + inputChangeId).val().length >= 5 && !isSame) {
                    CommunicationEngine.stopPolling();

                    customFilter = {};
                    customFilter.chatArchivePage = 1;
                    customFilter.chatArchiveQuery = $('#' + inputChangeId).val();
                    customFilter.chatArchiveFilter = '012';
                    customFilter.chatArchiveLimit = 10;
                    customFilter.chatArchiveFilterGroup = '';
                    customFilter.chatArchiveFilterExternal = '';
                    customFilter.chatArchiveFilterInternal = '';
                    customFilter.customDemandToken = 'linker';
                    CommunicationEngine.customFilters.push(customFilter);
                    CommunicationEngine.startPolling();
                }
                lzm_chatDisplay.archiveDisplay.fillLinkData($('#' + inputChangeId).val());
            }
        } else {
            $('#link-ticket-link').addClass('ui-disabled');
            var position = (firstObject == null) ? 'first' : 'second';
            $('#' + position + '-link-div').css({'visibility': 'hidden'});
            ticketPollData = null;
            chatPollData = null;
        }
    };
    if (inputChangeId != '') {
        $('#' + inputChangeId).keyup(function() {
            lastTyping = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
            setTimeout(function() {
                var now = lzm_chatTimeStamp.getServerTimeString(null, false, 1);
                if (lastTyping != 0 && now - lastTyping > 570) {
                    handleSearch(lastSeachId == $('#' + inputChangeId).val());
                    lastSeachId = $('#' + inputChangeId).val();
                }
            }, 600);
        });
    }

    $('#link-ticket-link').click(function() {
        linkTicket(firstType + '~' + secondType, $('#first-link-object-id').val(), $('#second-link-object-id').val());
        $('#link-ticket-cancel').click();
    });
    $('#link-ticket-cancel').click(function() {
        if (firstType == 'ticket' && firstObject != null) {
            lzm_displayHelper.removeDialogWindow('ticket-details');
            lzm_displayHelper.maximizeDialogWindow(dialogId);
        } else if (secondType == 'chat' && secondObject != null && inChatDialog) {
            lzm_displayHelper.removeDialogWindow(chatsWindowId);
            lzm_displayHelper.maximizeDialogWindow(chatsDialogId);
        } else {
            lzm_displayHelper.removeDialogWindow('link-chat-ticket');
        }
    });
};

ChatTicketClass.prototype.fillLinkData = function(position, ticketId, onlyReturnHtml, doNotClear) {
    onlyReturnHtml = (typeof onlyReturnHtml != 'undefined') ? onlyReturnHtml : false;
    doNotClear = (typeof doNotClear != 'undefined') ? doNotClear : false;
    doNotClear = doNotClear && $('#first-link-div').css('visibility') == 'visible';
    var myTicket = null, tableString = '';
    for (var i=0; i<lzm_chatDisplay.ticketListTickets.length; i++) {
        if (lzm_chatDisplay.ticketListTickets[i].id == ticketId) {
            myTicket = lzm_commonTools.clone(lzm_chatDisplay.ticketListTickets[i]);
        }
    }

    if (myTicket != null) {
        var ticketCreationDate = lzm_chatTimeStamp.getLocalTimeObject(myTicket.messages[0].ct * 1000, true);
        var ticketCreationDateHuman = lzm_commonTools.getHumanDate(ticketCreationDate, 'full', lzm_chatDisplay.userLanguage);
        tableString = '<table>' +

            '<tr><th rowspan="6"><i class="fa fa-envelope icon-green icon-xl"></i></th><th>' + t('Name:') + '</th><td>' + lzm_commonTools.escapeHtml(myTicket.messages[0].fn) + '</td></tr>' +
            '<tr><th>' + t('Email:') + '</th><td>' + lzm_commonTools.escapeHtml(myTicket.messages[0].em) + '</td></tr>' +
            '<tr><th>' + t('Company:') + '</th><td>' + lzm_commonTools.escapeHtml(myTicket.messages[0].co) + '</td></tr>' +
            '<tr><th>' + t('Phone:') + '</th><td>' + lzm_commonTools.escapeHtml(myTicket.messages[0].p) + '</td></tr>' +
            '<tr><th>' + t('Date:') + '</th><td>' + ticketCreationDateHuman + '</td></tr>' +
            '<tr><th>' + tidc('visitor_id') + '</th><td>' + myTicket.messages[0].ui + '</td></tr>' +
            '</table>';
        if (!onlyReturnHtml)
            $('#' + position + '-link-div').css({'visibility': 'visible'});
    } else {
        if (!onlyReturnHtml && !doNotClear)
            $('#' + position + '-link-div').css({'visibility': 'hidden'});
    }

    if (!onlyReturnHtml && !(doNotClear && tableString==''))
        $('#' + position + '-link-div').html(tableString);

    return tableString;
};

ChatTicketClass.prototype.showEmailList = function() {
    var that = this;
    lzm_chatDisplay.emailDeletedArray = [];
    lzm_chatDisplay.ticketsFromEmails = [];
    lzm_commonTools.clearEmailReadStatusArray();

    var headerString = t('Emails');
    var footerString = lzm_inputControls.createButton('save-email-list', '','', t('Ok'), '', 'lr',    {'margin-left': '6px'}, '' ,30, 'd') +
        lzm_inputControls.createButton('cancel-email-list', '','', t('Cancel'), '', 'lr', {'margin-left': '6px'}, '' ,30, 'd') +
        '<span style="float:left;">' +
        lzm_inputControls.createButton('delete-email', '','', t('Delete (Del)'), '<i class="fa fa-remove"></i>', 'lr', {'margin-left': '6px', 'margin-top': '-4px'} , '' ,30, 'e') +
        lzm_inputControls.createButton('create-ticket-from-email', '','', t('Create Ticket'), '<i class="fa fa-plus"></i>', 'lr', {'margin-left': '6px', 'margin-top': '-4px'}, '' ,30, 'e') +
        lzm_inputControls.createButton('reset-emails', 'ui-disabled','', t('Reset'), '', 'lr', {'margin-left': '6px', 'margin-top': '-4px'}, '' ,30, 'e')+
        '</span>';

    var bodyString = '<div id="open-emails">' +
        '<div id="email-list-placeholder"></div></div>' +
        '<div id="email-details">' +
        '<div id="email-placeholder" data-selected-email="0"></div>' +
        '</div>';

    var emailLoadingDiv = '<div id="email-list-loading"><div class="lz_anim_loading"></div></div>';
    var dialogData = {};
    var dialogId = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'email-list', {}, {}, {}, {}, '', dialogData, true, true);
    var emailContentHtml = '<div id="email-content"></div>';
    var emailHtmlHtml = '<div id="email-html" class="lzm-fieldset"></div>';
    var emailAttachmentHtml = '<div id="email-attachment-list"></div>';

    lzm_displayHelper.createTabControl('email-placeholder', [{name: t('Text'), content: emailContentHtml},{name: t('Html'), content: emailHtmlHtml}, {name: t('Attachments'), content: emailAttachmentHtml}]);
    lzm_displayHelper.createTabControl('email-list-placeholder', [{name: t('Incoming Emails'), content: emailLoadingDiv}]);

    var myHeight = $('#email-list-body').height() + 10;
    var listHeight = Math.floor(Math.max(myHeight / 2, 175) - 45);
    var contentHeight = (myHeight - listHeight) - 83;

    $('.email-list-placeholder-content').css({height: listHeight + 'px'});
    $('.email-list-placeholder-content').css({'border-bottom': '1px solid ' + CommonConfigClass.lz_brand_color});
    $('.email-placeholder-content').css({height: contentHeight + 'px'});
    $('#email-list-loading').css({'z-index': 1000000, background: '#fff',left:0, right:0, top:0, bottom:0, position: 'absolute' });

    var emailDetailsHeight = $('.email-placeholder-content').height();
    $('#email-content').css({'min-height': (emailDetailsHeight - 22) + 'px'});
    $('#email-html').css({'min-height': (emailDetailsHeight - 22) + 'px'});
    $('#email-attachment-list').css({'min-height': (emailDetailsHeight - 22) + 'px'});
    $('.email-placeholder-tab').click(function() {
        UIRenderer.resizeEmailDetails();
    });
    $('#cancel-email-list').click(function() {
        lzm_chatDisplay.emailDeletedArray = [];
        lzm_chatDisplay.ticketsFromEmails = [];
        toggleEmailList();
        lzm_displayHelper.removeDialogWindow('email-list');
    });
    $('#save-email-list').click(function() {
        saveEmailListChanges('', false);
        $('#cancel-email-list').click();
    });
    $('#delete-email').click(function() {
        if (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'delete_emails', {})) {
            deleteEmail();
        } else {
            showNoPermissionMessage();
        }
    });
    $('#create-ticket-from-email').click(function() {
        if (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'create_tickets', {}))
        {
            var emailId = $('#email-placeholder').data('selected-email-id');
            var emailNo = $('#email-placeholder').data('selected-email');
            $('#reset-emails').removeClass('ui-disabled');
            $('#delete-email').addClass('ui-disabled');
            $('#create-ticket-from-email').addClass('ui-disabled');
            $('#email-list-line-' + emailNo).children('td:first').html('<i class="fa fa-plus" style="color: #00bb00;"></i>');
            saveEmailListChanges(emailId, true);
            showTicketDetails('', false, emailId, '', dialogId);
            $('#email-list-body').data('selected-email', emailNo);
            $('#email-list-body').data('selected-email-id', emailId);
        } else {
            showNoPermissionMessage();
        }
    });
    $('#reset-emails').click(function() {
        $('.selected-table-line').each(function(i, obj) {
            if($(obj).hasClass('email-list-line')){
                var emailId = $(obj).attr('data-id'); //$('#email-placeholder').data('selected-email-id');
                var emailNo = $(obj).attr('data-line-number'); //$('#email-placeholder').data('selected-email');
                lzm_commonTools.removeEmailFromDeleted(emailId);
                lzm_commonTools.removeEmailFromTicketCreation(emailId);
                $('#email-list-line-' + emailNo).children('td:first').html('<i class="fa fa-envelope-o"></i>');
                $('#reset-emails').addClass('ui-disabled');
                $('#delete-email').removeClass('ui-disabled');
                $('#create-ticket-from-email').removeClass('ui-disabled');
                if (lzm_commonTools.checkEmailIsLockedBy(emailId, lzm_chatDisplay.myId)) {
                    saveEmailListChanges(emailId, false);
                }
            }
        });
    });
};

ChatTicketClass.prototype.updateEmailList = function() {
    var that = this, emails = DataEngine.emails, i = 0;
    var selectedLine = $('#email-placeholder').data('selected-email');
    selectedLine = (typeof selectedLine != 'undefined') ? selectedLine : $('#email-list-body').data('selected-email');

    if(emails.length > selectedLine)
    {
        $('#email-placeholder').data('selected-email-id', emails[selectedLine].id);
        if (lzm_commonTools.checkEmailReadStatus($('#email-placeholder').data('selected-email-id')) == -1 && lzm_chatTimeStamp.getServerTimeString(null, true) - emails[selectedLine].c <= 1209600)
            lzm_chatDisplay.emailReadArray.push({id: emails[selectedLine].id, c: emails[selectedLine].c});
    }
    else
    {
        $('#email-placeholder').data('selected-email-id', 0);
        $('#cancel-email-list').click();
        return;
    }

    var emailListHtml = '<div id="incoming-email-list" data-role="none">' +
        '<table id="incoming-email-table" class="visible-list-table alternating-rows-table lzm-unselectable"><thead><tr>' +
        '<th style="width: 18px !important;"></th>' +
        '<th style="width: 18px !important;"></th>' +
        '<th>' + t('Date') + '</th>' +
        '<th>' + tid('subject') + '</th>' +
        '<th>' + t('Email') + '</th>' +
        '<th>' + t('Name') + '</th>' +
        '<th>' + t('Group') + '</th>' +
        '<th>' + t('Sent to') + '</th>' +
        '</tr></thead><tbody>';

    for (i=0; i<emails.length; i++)
    {
        var group = DataEngine.groups.getGroup(emails[i].g);
        emailListHtml += that.createEmailListLine(emails[i], i, group);
    }
    emailListHtml += '</tbody>';

    if (DataEngine.emailCount > CommunicationEngine.emailAmount)
    {
        emailListHtml += '<tfoot><tr>' +
            '<td colspan="8" id="emails-load-more"><span>' + t('Load more emails') + '</span></td></tr></tfoot>';
    }
    emailListHtml += '</table></div>';

    var emailText = lzm_commonTools.htmlEntities(emails[selectedLine].text).replace(/\r\n/g, '<br>').replace(/\r/g, '<br>').replace(/\n/g, '<br>');
    var contentHtml = this.createEmailPreview(emailText,emails[selectedLine]);
    var emailIdEnc = lz_global_base64_url_encode(emails[selectedLine].id);
    var htmlEmailUrl = CommunicationEngine.chosenProfile.server_protocol + CommunicationEngine.chosenProfile.server_url + '/email.php?ws=' + multiServerId + '&id=' + emailIdEnc;
    var htmlHtml = '<iframe id="html-email-' + emailIdEnc.substr(0, 10) + '" class="html-email-iframe" src="' + htmlEmailUrl + '"></iframe>';
    var attachmentHtml = that.createTicketAttachmentTable({}, emails[selectedLine], -1, false);
    $('#email-content').html(contentHtml);
    $('#email-html').html(htmlHtml);
    $('#email-attachment-list').html(attachmentHtml);
    $('#email-list-loading').remove();
    $('#email-list-placeholder-content-0').html(emailListHtml);

    var emailListHeight = $('.email-list-placeholder-content').height();
    $('#incoming-email-list').css({'min-height': (emailListHeight - 22) + 'px'});
    $('#email-text').css({'height': ($('.email-placeholder-content').height() - 50) + 'px'});

    if (emails[selectedLine].ei != '' && emails[selectedLine].ei != lzm_chatDisplay.myId) {
        $('#reset-emails').addClass('ui-disabled');
        $('#delete-email').addClass('ui-disabled');
        $('#create-ticket-from-email').addClass('ui-disabled');
    } else if (emails[selectedLine].ei != '' && emails[selectedLine].ei == lzm_chatDisplay.myId) {
        $('#reset-emails').removeClass('ui-disabled');
    }

    $('.email-list-line').click(function(e) {

        var oldSelectedLine = selectedLine,i;
        var newSelectedLine = $(this).data('line-number');
        var isMultiLine = (e.shiftKey || e.ctrlKey);
        var isShiftSelect = (e.shiftKey);
        var emailId = emails[selectedLine].id;

        if(!isMultiLine)
            $('.email-list-line').removeClass('selected-table-line');

        if (emails[oldSelectedLine].ei != '') {
            if (lzm_commonTools.checkEmailTicketCreation(emailId) == -1 && $.inArray(emailId, lzm_chatDisplay.emailDeletedArray) == -1)
                $('#email-list-line-' + oldSelectedLine).children('td:first').html('<i class="fa fa-lock icon-orange"></i>');
            $('#email-list-line-' + oldSelectedLine).addClass('locked-email-line');
        }

        if(isShiftSelect && Math.abs($(this).data('line-number')-oldSelectedLine) > 1)
        {
            if(newSelectedLine>selectedLine)
                for(i=selectedLine;i<newSelectedLine;i++)
                    $('#email-list-line-' + i).addClass('selected-table-line');
            else if(newSelectedLine<selectedLine)
                for(i=selectedLine;i>newSelectedLine;i--)
                    $('#email-list-line-' + i).addClass('selected-table-line');
        }

        selectedLine = newSelectedLine;
        that.selectedEmailNo = newSelectedLine;
        emailId = emails[selectedLine].id;
        $('#email-list-line-' + selectedLine).removeClass('locked-email-line');
        $('#email-list-line-' + selectedLine).addClass('selected-table-line');
        $('#email-placeholder').data('selected-email', selectedLine);
        $('#email-placeholder').data('selected-email-id', emailId);

        var emailText = lzm_commonTools.htmlEntities(emails[selectedLine].text).
            replace(/\r\n/g, '<br>').replace(/\r/g, '<br>').replace(/\n/g, '<br>');

        var contentHtml = that.createEmailPreview(emailText,emails[selectedLine]);
        var emailIdEnc = lz_global_base64_url_encode(emails[selectedLine].id);
        var htmlEmailUrl = CommunicationEngine.chosenProfile.server_protocol + CommunicationEngine.chosenProfile.server_url + '/email.php?ws=' + multiServerId + '&id=' + emailIdEnc;
        var htmlHtml = '<iframe id="html-email-' + emailIdEnc.substr(0, 10) + '" class="html-email-iframe" src="' + htmlEmailUrl + '"></iframe>';
        var attachmentHtml = that.createTicketAttachmentTable({}, emails[selectedLine], -1, false);
        $('#email-content').html(contentHtml);
        $('#email-html').html(htmlHtml);
        $('#email-attachment-list').html(attachmentHtml);
        $('#email-text').css({'min-height': ($('.email-placeholder-content').height() - 83) + 'px'});
        if (lzm_commonTools.checkEmailReadStatus(emails[selectedLine].id) == -1 &&
            lzm_chatTimeStamp.getServerTimeString(null, true) - emails[selectedLine].c <= 1209600) {
            lzm_chatDisplay.emailReadArray.push({id: emails[selectedLine].id, c: emails[selectedLine].c});
            if (emails[selectedLine].ei != '') {
                if (lzm_commonTools.checkEmailTicketCreation(emailId) == -1 && $.inArray(emailId, lzm_chatDisplay.emailDeletedArray) == -1) {
                    $('#email-list-line-' + selectedLine).children('td:first').html('<i class="fa fa-lock icon-orange"></i>');
                }
            } else {
                $('#email-list-line-' + selectedLine).children('td:first').html('<i class="fa fa-envelope-o"></i>');
            }
            $('#email-list-line-' + selectedLine).children('td').css('font-weight', 'normal');
        }

        if (emails[selectedLine].ei != '' && emails[selectedLine].ei != lzm_chatDisplay.myId) {
            $('#reset-emails').addClass('ui-disabled');
            $('#delete-email').addClass('ui-disabled');
            $('#create-ticket-from-email').addClass('ui-disabled');
        } else {
            if (lzm_commonTools.checkEmailTicketCreation(emailId) != -1 || $.inArray(emailId, lzm_chatDisplay.emailDeletedArray) != -1) {
                $('#reset-emails').removeClass('ui-disabled');
                $('#delete-email').addClass('ui-disabled');
                $('#create-ticket-from-email').addClass('ui-disabled');
            } else if (emails[selectedLine].ei != '' && emails[selectedLine].ei == lzm_chatDisplay.myId) {
                $('#reset-emails').removeClass('ui-disabled');
                $('#delete-email').removeClass('ui-disabled');
                $('#create-ticket-from-email').removeClass('ui-disabled');
            } else {
                $('#reset-emails').addClass('ui-disabled');
                $('#delete-email').removeClass('ui-disabled');
                $('#create-ticket-from-email').removeClass('ui-disabled');
            }
        }
        UIRenderer.resizeEmailDetails();
    });
    $('#emails-load-more').click(function()
    {
        CommunicationEngine.emailAmount += 20;
        CommunicationEngine.emailUpdateTimestamp = 0;
        CommunicationEngine.removePropertyFromDataObject('p_de_a');
        CommunicationEngine.addPropertyToDataObject('p_de_a', CommunicationEngine.emailAmount);
        $('#incoming-email-table').children('tfoot').remove();
    });

    UIRenderer.resizeEmailDetails();
};

ChatTicketClass.prototype.createEmailPreview = function(emailText,email) {
    var html = '<div class="lzm-dialog-headline3">' +
        '<div id="email-sender-name"><b>' + t("Name") + "</b>: " + lzm_commonTools.htmlEntities(email.n) + '</div>' +
        '<div id="email-subject"><b>' + t("Subject") + "</b>: " + lzm_commonTools.htmlEntities(email.s) + '</div>' +
        '</div>' +
        '<div id="email-text" style="overflow-y: auto;padding:10px;height:20px;">' + emailText + '</div>';
    return html;

}

ChatTicketClass.prototype.createEmailListLine = function(email, lineNumber, group) {
    var selectedClass = (lineNumber == $('#email-placeholder').data('selected-email')) ? ' selected-table-line' : '';
    var attachmentIcon = (email.attachment.length > 0) ? '<i class="fa fa-paperclip"></i>' : '';
    var statusIcon = '<i class="fa fa-envelope"></i>';
    var fontWeight = 'bold';

    if ($.inArray(email.id, lzm_chatDisplay.emailDeletedArray) != -1)
    {
        statusIcon = '<i class="fa fa-remove icon-red"></i>';
        fontWeight = 'normal';
    }
    else if (lzm_commonTools.checkEmailTicketCreation(email.id) != -1)
    {
        statusIcon = '<i class="fa fa-plus icon-green"></i>';
        fontWeight = 'normal';
    }
    else if (email.ei != '')
    {
        statusIcon = '<i class="fa fa-lock icon-orange"></i>';
        fontWeight = 'normal';
        if (lineNumber != $('#email-placeholder').data('selected-email')) {
            selectedClass = ' locked-email-line';
        }
    }
    else if (lzm_chatTimeStamp.getServerTimeString(null, true) - email.c > 1209600 || lzm_commonTools.checkEmailReadStatus(email.id) != -1)
    {
        statusIcon = '<i class="fa fa-envelope-o"></i>';
        fontWeight = 'normal';
    }

    var gid = (group != null) ? group.id : '?';

    var emailTime = lzm_chatTimeStamp.getLocalTimeObject(email.c * 1000, true);
    var emailHtml = '<tr class="email-list-line lzm-unselectable' + selectedClass + '" id="email-list-line-' + lineNumber + '" data-id="'+email.id+'" data-line-number="' + lineNumber + '"' +
        ' data-locked-by="' + email.ei + '" style="cursor:pointer;">' +
        '<td class="icon-column" style="font-weight: ' + fontWeight + '; text-align:center;padding:0 10px;">' + statusIcon + '</td>' +
        '<td class="icon-column" style="font-weight: ' + fontWeight + '; text-align:center;padding:0 6px;">' + attachmentIcon + '</td>' +
        '<td style="font-weight: ' + fontWeight + '; white-space: nowrap;">' + lzm_commonTools.getHumanDate(emailTime, '', lzm_chatDisplay.userLanguage) + '</td>' +
        '<td style="font-weight: ' + fontWeight + '; white-space: nowrap;">' + lzm_commonTools.htmlEntities(lzm_commonTools.SubStr(email.s,30,true)) + '</td>' +
        '<td style="font-weight: ' + fontWeight + '; white-space: nowrap;">' + lzm_commonTools.htmlEntities(email.e) + '</td>' +
        '<td style="font-weight: ' + fontWeight + '; white-space: nowrap;">' + lzm_commonTools.htmlEntities(lzm_commonTools.SubStr(email.n,30,true)) + '</td>' +
        '<td style="font-weight: ' + fontWeight + '; white-space: nowrap;">' + gid + '</td>' +
        '<td style="font-weight: ' + fontWeight + '; white-space: nowrap;">' + email.r + '</td>' +
        '</tr>';
    return emailHtml;
};

ChatTicketClass.prototype.checkTicketTakeOverReply = function() {
    var rtValue = lzm_commonPermissions.checkUserPermissions('', 'tickets', 'assign_operators', {});
    if (!rtValue) {
        showNoPermissionMessage();
    }
    return rtValue;
};

ChatTicketClass.prototype.ticketMessageSortfunction = function(a,b) {
    var rtValue = (parseInt(a.ct) < parseInt(b.ct)) ? -1 : (parseInt(a.ct) > parseInt(b.ct)) ? 1 : 0;
    return rtValue;
};

ChatTicketClass.prototype.checkTicketDetailsChangePermission = function (ticket, changedValues) {
    var rtValue = true;
    if (typeof ticket.editor != 'undefined' && ticket.editor != false && ticket.editor.st != changedValues.status) {
        if ((!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_open', {}) && changedValues.status == 0) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_progress', {}) && changedValues.status == 1) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_closed', {}) && changedValues.status == 2) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_deleted', {}) && changedValues.status == 3)) {
            rtValue = false;
        }
    } else if ((typeof ticket.editor == 'undefined' || ticket.editor == false) && changedValues.status != 0) {
        if ((!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_progress', {}) && changedValues.status == 1) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_closed', {}) && changedValues.status == 2) ||
            (!lzm_commonPermissions.checkUserPermissions('', 'tickets', 'status_deleted', {}) && changedValues.status == 3)) {
            rtValue = false;
        }
    }
    return rtValue;
};

ChatTicketClass.prototype.createTicketDetailsChangeHandler = function(selectedTicket) {
    var that = this;
    var selected = '', statusSelect = $('#ticket-details-status'), subStatusSelect = $('#ticket-details-sub-status'),channelSelect = $('#ticket-details-channel'), subChannelSelect = $('#ticket-details-sub-channel');

    statusSelect.change(function() {
        subStatusSelect.find('option').remove();
        subStatusSelect.append('<option value="">-</option>');
        var myStatus = statusSelect.val();
        for(key in DataEngine.global_configuration.database['tsd'])
        {
            var elem = DataEngine.global_configuration.database['tsd'][key];
            if(elem.type == 0 && elem.parent == myStatus){
                selected = (selectedTicket.editor && selectedTicket.editor.ss == elem.name) ? ' selected' : '';
                subStatusSelect.append('<option value="'+elem.name+'"'+selected+'>'+elem.name+'</option>');
            }
        }
        if($('#ticket-details-sub-status option').size()==0)
        {
            subStatusSelect.append('<option>-</option>');
            subStatusSelect.addClass('ui-disabled');
        }
        else
            subStatusSelect.removeClass('ui-disabled');
    });
    statusSelect.change();
    channelSelect.change(function() {
        subChannelSelect.find('option').remove();
        subChannelSelect.append('<option value="">-</option>');
        var myChannel = channelSelect.val();
        for(key in DataEngine.global_configuration.database['tsd'])
        {
            var elem = DataEngine.global_configuration.database['tsd'][key];
            if(elem.type == 1 && elem.parent == myChannel){
                selected = (selectedTicket.s == elem.name) ? ' selected' : '';
                subChannelSelect.append('<option value="'+elem.name+'"'+selected+'>'+elem.name+'</option>');
            }
        }
        if($('#ticket-details-sub-channel option').size()==0)
        {
            subChannelSelect.append('<option>-</option>');
            subChannelSelect.addClass('ui-disabled');
        }
        else
            subChannelSelect.removeClass('ui-disabled');
    });
    channelSelect.change();

    $('#ticket-details-group').change(function() {
        var i, selectedString;
        var selectedGroupId = $('#ticket-details-group').val();
        var selectedOperator = $('#ticket-details-editor').val();
        var operators = DataEngine.operators.getOperatorList('name', selectedGroupId);
        var editorSelectString = '<option value="-1">' + tid('none') + '</option>';
        for (i=0; i<operators.length; i++) {
            if (operators[i].isbot != 1) {
                selectedString = (operators[i].id == selectedOperator) ? ' selected="selected"' : '';
                editorSelectString += '<option value="' + operators[i].id + '"' + selectedString + '>' + operators[i].name + '</option>';
            }
        }
        var selectedLanguage = $('#ticket-details-language').val();

        var availableLanguages = [];
        var group = DataEngine.groups.getGroup(selectedGroupId);
        for (i=0; i<group.pm.length; i++) {
            availableLanguages.push(group.pm[i].lang);
        }
        if ( typeof selectedTicket.l != 'undefined' && $.inArray(selectedTicket.l, availableLanguages) == -1) {
            availableLanguages.push(selectedTicket.l);
        }
        if ($.inArray(selectedLanguage, availableLanguages) == -1) {
            availableLanguages.push(selectedLanguage);
        }
        var langSelectString = '';
        for (i=0; i<availableLanguages.length; i++) {
            selectedString = (availableLanguages[i] == selectedLanguage) ? ' selected="selected"' : '';
            langSelectString += '<option value="' + availableLanguages[i] + '"' + selectedString + '>' + lzm_chatDisplay.getLanguageDisplayName(availableLanguages[i]) + '</option>';
        }
        $('#ticket-details-editor').html(editorSelectString).trigger('create');
        $('#ticket-details-language').html(langSelectString).trigger('create');
        that.saveUpdatedTicket(selectedTicket,null,selectedGroupId);

    });
    $('#ticket-details-language').change(function() {
        that.saveUpdatedTicket(selectedTicket,$('#ticket-details-language').val(),null);
    });
};

ChatTicketClass.prototype.saveUpdatedTicket = function(ticket,lang,group) {
    if(!(this.updatedTicket!=null && this.updatedTicket.id == ticket.id))
        this.updatedTicket = lzm_commonTools.clone(ticket);
    if(lang != null)
        this.updatedTicket.l = lang;
    if(group != null)
        this.updatedTicket.gr = group;
};

ChatTicketClass.prototype.createTicketListContextMenu = function(myObject, place, widthOffset) {
    var contextMenuHtml = '',disabledClass,elem,key;
    var dialogId = (place == 'ticket-list') ? '' : $('#visitor-information').data('dialog-id');
    contextMenuHtml += '<div onclick="showTicketDetails(\'' + myObject.id + '\', true, \'\', \'\', \'' + dialogId + '\');"><span id="show-ticket-details" class="cm-line cm-click">' + t('Open Ticket') + '</span></div><hr />';
    if($.inArray(myObject.id,DataEngine.ticketWatchList) == -1)
        contextMenuHtml += '<div onclick="addTicketToWatchList(\'' + myObject.id + '\',\'' + DataEngine.myId + '\');"><span id="add-ticket-to-wl" class="cm-line cm-click">' + tid('add_to_watch_list') + '</span></div>';
    else
        contextMenuHtml += '<div onclick="removeTicketFromWatchList(\'' + myObject.id + '\');"><span id="add-ticket-to-wl" class="cm-line cm-click">' + tid('remove_from_watch_list') + '</span></div>';
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'add_to_watch_list\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"><span id="show-group-submenu" class="cm-line cm-click">' + tid('add_to_watch_list_of') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div><hr />';
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'ticket_priority\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"><span id="show-group-submenu" class="cm-line cm-click">' + tid('priority') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div>';
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'ticket_status\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"><span id="show-group-submenu" class="cm-line cm-click">' + tid('status') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div>';
    disabledClass = ' class="ui-disabled"';
    var tstatus = myObject.editor ? myObject.editor.st : 0;
    for(key in DataEngine.global_configuration.database['tsd'])
    {
        elem = DataEngine.global_configuration.database['tsd'][key];
        if(elem.type == 0 && elem.parent == tstatus)
            disabledClass = '';
    }
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'ticket_sub_status\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"'+disabledClass+'><span id="show-group-submenu" class="cm-line cm-click">' + tid('sub_status') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div>';
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'ticket_channel\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"><span id="show-group-submenu" class="cm-line cm-click">' + tid('channel') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div>';
    disabledClass = ' class="ui-disabled"';

    var tchannel = myObject.t;
    for(key in DataEngine.global_configuration.database['tsd'])
    {
        elem = DataEngine.global_configuration.database['tsd'][key];
        if(elem.type == 1 && elem.parent == tchannel)
            disabledClass = '';
    }
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'ticket_sub_channel\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"'+disabledClass+'><span id="show-group-submenu" class="cm-line cm-click">' + tid('sub_channel') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div>';
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'operator\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"><span id="show-operator-submenu" class="cm-line cm-click">' + tid('operator') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div>';
    contextMenuHtml += '<div onclick="showSubMenu(\'' + place + '\', \'group\', \'' + myObject.id + '\', %CONTEXTX%, %CONTEXTY%, %MYWIDTH%+'+widthOffset+', %MYHEIGHT%)"><span id="show-group-submenu" class="cm-line cm-click">' + t('Group') + '</span><i class="fa fa-caret-right lzm-ctxt-right-fa"></i></div><hr>';

    disabledClass = ($('tr.ticket-list-row.selected-table-line').length>=2) ? '' : ' class="ui-disabled"';

    contextMenuHtml += '<div onclick="mergeTickets();" ' + disabledClass + '><span class="cm-line cm-click">' + tid('merge') + '</span></div><hr />';
    contextMenuHtml += '<div onclick="showFilterCreation(\'email\',\'\',\'\',\'\',false,\'' + myObject.id + '\');"><span class="cm-line cm-click">' + tid('new_email_filter') + '</span></div><hr />';
    contextMenuHtml += '<div onclick="changeTicketStatus(4,null,null,null,false);"><span class="cm-line cm-click">' + tid('remove') + '</span></div><hr />';
    disabledClass = ((myObject.u <= lzm_chatDisplay.ticketGlobalValues.mr && lzm_commonTools.checkTicketReadStatus(myObject.id, lzm_chatDisplay.ticketUnreadArray) == -1) || (myObject.u > lzm_chatDisplay.ticketGlobalValues.mr && lzm_commonTools.checkTicketReadStatus(myObject.id, lzm_chatDisplay.ticketReadArray, lzm_chatDisplay.ticketListTickets) != -1)) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div onclick="changeTicketReadStatus(\'' + myObject.id + '\', \'read\');" ' + disabledClass + '><span id="set-ticket-read" class="cm-line cm-click">' + t('Mark as read') + '</span></div>';
    if (place == 'ticket-list')
        contextMenuHtml += '<div onclick="setAllTicketsRead();"><span id="set-all-tickets-read" class="cm-line cm-click">' + t('Mark all as read') + '</span></div>';
    return contextMenuHtml
};

ChatTicketClass.prototype.createTicketFilterMenu = function (myObject) {
    return ''; // deprecated
};

ChatTicketClass.prototype.createTicketDetailsContextMenu = function(myObject) {
    var contextMenuHtml = '', disabledClass = '';
    contextMenuHtml += '<div onclick="removeTicketMessageContextMenu(); $(\'#reply-ticket-details\').click();">' +
        '<i class="fa fa-reply"></i>' +
        '<span id="reply-this-message" class="cm-line cm-line-icon-left cm-click">' +
        t('Reply') + '</span></div>';
    contextMenuHtml += '<div onclick="showMessageForward(\'' + myObject.ti.id + '\', \'' + myObject.msg + '\');">' +
        '<i class="fa fa-share"></i>' +
        '<span id="forward-this-message" class="cm-line cm-line-icon-left cm-click">' +
        t('Forward') + '</span></div>';
    disabledClass = (myObject.ti.messages[myObject.msg].t != 1) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="sendForwardedMessage({id : \'\'}, \'\', \'\', \'\', \'' + myObject.ti.id + '\', \'\', \'' + myObject.msg + '\')">' +
        '<span id="resend-this-message" class="cm-line cm-click">' +
        t('Resend message') + '</span></div>';
    contextMenuHtml += '<div onclick="printTicketMessage(\'' + myObject.ti.id + '\', \'' + myObject.msg + '\');">' +
        '<span id="print-this-message" class="cm-line cm-click">' +
        t('Print Message') + '</span></div><hr />';
    contextMenuHtml += '<div onclick="showPhoneCallDialog(\'' + myObject.ti.id + '\', \'' + myObject.msg + '\', \'ticket\');">' +
        '<span id="call-this-message-sender" class="cm-line cm-click">' +
        t('Phone Call') + '</span></div><hr />';
    contextMenuHtml += '<div onclick="showTicketLinker(\'' + myObject.ti.id + '\', \'\', \'ticket\', \'chat\')">' +
        '<span id="link-ticket-chat" class="cm-line cm-click">' +
        t('Link this Ticket with Chat') + '</span></div>';
    contextMenuHtml += '<div onclick="showTicketLinker(\'' + myObject.ti.id + '\', \'\', \'ticket\', \'ticket\')"><span id="link-ticket-chat" class="cm-line cm-click">' +
        tid('link_ticket_with_ticket') + '</span></div>';
    var emailIdEnc = lz_global_base64_url_encode(myObject.ti.messages[myObject.msg].ci);

    disabledClass = ((myObject.ti.messages[myObject.msg].t == 3 || myObject.ti.messages[myObject.msg].t == 4)) ? '' : ' class="ui-disabled"';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showHtmlEmail(\'' + emailIdEnc + '\')"><span id="show-html-email" class="cm-line cm-click">' + t('Show Html Email') + '</span></div>';


    disabledClass = (myObject.msg == 0) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="moveMessageToNewTicket(\'' + myObject.ti.id + '\', \'' + myObject.msg + '\')">' +
        '<span id="copy-msg-to-new" class="cm-line cm-click">' +
        t('Copy message into new Ticket') + '</span></div>';
    disabledClass = (DataEngine.otrs == '' || DataEngine.otrs == null) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showTicketMsgTranslator(\'' + myObject.ti.id + '\', \'' + myObject.msg + '\')">' +
        '<span id="translate-ticket-msg" class="cm-line cm-click">' +
        t('Translate') + '</span></div><hr />';

    contextMenuHtml += '<div onclick="addComment(\'' + myObject.ti.id + '\', \'\')"><span class="cm-line cm-click">' + tid('add_comment') + '</span></div><hr />';

    disabledClass = ($('#message-details-inner').data('edit')) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="removeTicketMessageContextMenu(); toggleMessageEditMode();">' +
        '<span id="edit-msg" class="cm-line cm-click">' +
        t('Edit Message') + '</span></div>';
    return contextMenuHtml;
};

ChatTicketClass.prototype.subDefinitionIsValid = function(type,parent,sub) {
    for(var key in DataEngine.global_configuration.database['tsd'])
    {
        var tsd = DataEngine.global_configuration.database['tsd'][key];
        if(tsd.type == type && tsd.parent==parent && tsd.name == sub)
            return true;
    }
    return false;
}

ChatTicketClass.prototype.setTicketFilter = function() {

    var allChecked = true, tsd = null, key = '', check = false, checked = false, fgroups = '', fchannels = '', fsubchannels = '', filterHTML = '<div><fieldset class="lzm-fieldset"><legend>'+tid('groups')+'</legend>';
    var groups = DataEngine.groups.getGroupList('id',true,false);
    for (i=0; i<groups.length; i++)
    {
        check = (CommunicationEngine.ticketFilterGroups != null) ? CommunicationEngine.ticketFilterGroups.indexOf('\'' + groups[i].id + '\'')!==-1 : true;
        filterHTML += lzm_inputControls.createCheckbox('stf-g-' + md5(groups[i].id), groups[i].id,check);
    }

    filterHTML += '</fieldset><br>';
    filterHTML += '<fieldset class="lzm-fieldset"><legend>'+tid('channels')+'</legend>';

    for (var aChannel=0; aChannel<ChatTicketClass.m_TicketChannels.length; aChannel++) {
        var sc = ChatTicketClass.m_TicketChannels[aChannel];
        check = (CommunicationEngine.ticketFilterChannel != null) ? CommunicationEngine.ticketFilterChannel.toString().indexOf(aChannel.toString())!==-1 : true;
        filterHTML += lzm_inputControls.createCheckbox('stf-c-' + aChannel, sc.key,check, false, 'stf-channel');
        for(key in DataEngine.global_configuration.database['tsd'])
        {
            tsd = DataEngine.global_configuration.database['tsd'][key];
            if(tsd.type == 1 && tsd.parent == sc.index){
                check = (CommunicationEngine.ticketFilterSubChannels != null) ? CommunicationEngine.ticketFilterSubChannels.indexOf(lz_global_base64_encode(tsd.parent + tsd.name))!==-1 : true;
                filterHTML += '<div class="left-space-child">' + lzm_inputControls.createCheckbox('stf-sc-' + md5(tsd.sid+tsd.parent+tsd.type.toString()), tsd.name,check,false,'stf-c-' + aChannel)+'</div>';
            }
        }
    }
    filterHTML += '</fieldset><br></div>';

    var headerString = tid('filters');
    var footerString = lzm_inputControls.createButton('stf-ok-btn', '', '', tid('ok'), '', 'force-text',{'margin-left': '4px','padding': '3px 10px'},'',30,'d');
    var dialogData = {};
    var bodyString = filterHTML;
    lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'set_ticket_filter', {}, {}, {}, {}, '', dialogData, false, false, 'set_ticket_filter_dialog');

    $('.stf-channel').change(function(){
        if($(this).prop('checked'))
            $('.'+$(this).attr('id')).removeClass('ui-disabled');
        else
            $('.'+$(this).attr('id')).addClass('ui-disabled');
    });
    $('.stf-channel').change();
    $('#stf-ok-btn').click(function() {
        for (i=0; i<groups.length; i++)
        {
            checked = $('#' + 'stf-g-' + md5(groups[i].id)).prop('checked');

            if(checked){
                if (fgroups=='')
                    fgroups = "'" + groups[i].id + "'";
                else
                    fgroups += "," + "'" + groups[i].id + "'";
            }
            else
                allChecked = false;
        }

        CommunicationEngine.ticketFilterGroups = (allChecked) ? null : fgroups;

        if(!allChecked)
            lzm_commonStorage.saveValue('ticket_filter_groups_' + DataEngine.myId,lz_global_base64_encode(fgroups));
        else
            lzm_commonStorage.deleteKeyValuePair('ticket_filter_groups_' + DataEngine.myId);


        var allChannelsChecked = true, allSubChannelsChecked = true;
        for (var aChannel=0; aChannel<ChatTicketClass.m_TicketChannels.length; aChannel++) {
            var sc = ChatTicketClass.m_TicketChannels[aChannel];

            checked = $('#' + 'stf-c-' + aChannel).prop('checked');
            if(!checked)
                allChannelsChecked = false;
            fchannels += (checked) ? sc.index.toString() : '';

            for(key in DataEngine.global_configuration.database['tsd'])
            {
                tsd = DataEngine.global_configuration.database['tsd'][key];
                if(tsd.type == 1 && tsd.parent == sc.index){
                    checked = $('#' + 'stf-sc-' + md5(tsd.sid+tsd.parent+tsd.type.toString())).prop('checked');
                    if(!checked)
                        allSubChannelsChecked = false;
                    else
                    {
                        if (fsubchannels=='')
                            fsubchannels = lz_global_base64_encode(tsd.parent + tsd.name);
                        else
                            fsubchannels += "," + lz_global_base64_encode(tsd.parent + tsd.name);
                    }
                }
            }
        }

        CommunicationEngine.ticketFilterChannel = (allChannelsChecked) ? '01234567' : fchannels;
        CommunicationEngine.ticketFilterSubChannels = (allSubChannelsChecked) ? null : fsubchannels;

        if(!allChannelsChecked)
            lzm_commonStorage.saveValue('ticket_filter_channel_' + DataEngine.myId,fchannels);
        else
            lzm_commonStorage.deleteKeyValuePair('ticket_filter_channel_' + DataEngine.myId);

        if(!allSubChannelsChecked)
            lzm_commonStorage.saveValue('ticket_filter_sub_channels_' + DataEngine.myId,fsubchannels);
        else
            lzm_commonStorage.deleteKeyValuePair('ticket_filter_sub_channels_' + DataEngine.myId);

        toggleTicketFilter();
        lzm_displayHelper.removeDialogWindow('set_ticket_filter');
    });
};

ChatTicketClass.__ProcessNext = function(_getCount) {

    var isEditorId,ticket,key,candidates = [],candidates_final=[],priot=false,tlist = {};
    tlist['cat_prio_my_prio'] = [];
    tlist['cat_prio_open_prio'] = [];
    tlist['cat_prio_my'] = [];
    tlist['cat_prio_open'] = [];
    for(key in lzm_chatDisplay.ticketListTickets)
    {
        ticket = lzm_chatDisplay.ticketListTickets[key];
        isEditorId = ticket.editor && ticket.editor.ed != '';

        // my with prio
        if(ticket.editor && ticket.editor.st < 2 && ticket.editor.ed == DataEngine.myId && ticket.p > 2)
        {
            priot = true;
            tlist['cat_prio_my_prio'].push(ticket);
        }
        // open tickets with prio
        else if(!isEditorId && ticket.p > 2)
        {
            priot = true;
            tlist['cat_prio_open_prio'].push(ticket);
        }
        // my open tickets
        else if(ticket.editor && ticket.editor.st < 2 && ticket.editor.ed == DataEngine.myId)
        {
            tlist['cat_prio_my'].push(ticket);
        }
        // open tickets
        else if(!isEditorId)
        {
            tlist['cat_prio_open'].push(ticket);
        }
    }

    if(tlist['cat_prio_my_prio'].length)
        candidates = tlist['cat_prio_my_prio'];
    else if(tlist['cat_prio_open_prio'].length)
        candidates = tlist['cat_prio_open_prio'];
    else if(tlist['cat_prio_my'].length)
        candidates = tlist['cat_prio_my'];
    else if(tlist['cat_prio_open'].length)
        candidates = tlist['cat_prio_open'];
    else
    {
        return 0;
    }

    if(priot)
    {
        candidates = lzm_commonTools.SortByProperty(candidates,'p',true);
        var hp = -1;
        for(key in candidates)
        {
            if(candidates[key].p > hp)
            {
                candidates_final.push(candidates[key]);
                hp = candidates[key].p;
            }
            else
                break;
        }
    }
    else
        candidates_final = candidates;

    if(_getCount)
        return candidates_final.length;

    candidates_final = lzm_commonTools.SortByProperty(candidates_final,'w',false);
    selectTicket(candidates_final[0].id);
    showTicketDetails();
    return true;
};
