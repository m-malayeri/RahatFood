/****************************************************************************************
 * LiveZilla ChatVisitorClass.js
 *
 * Copyright 2016 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function ChatVisitorClass() {

}

ChatVisitorClass.VisitorInformationId = '';
ChatVisitorClass.SelectedVisitor = '';
ChatVisitorClass.LastListUpdate = 0;
ChatVisitorClass.LastTimestampUpdate = 0;
ChatVisitorClass.VisitorListCreated = false;

ChatVisitorClass.prototype.ResetVisitorList = function(_full) {

    if(_full)
    {
        VisitorManager.DUTVisitorBrowserEntrance = 0;
        VisitorManager.DUTVisitorBrowserURLs = 0;
        VisitorManager.DUTVisitors = 0;
        VisitorManager.Visitors = [];
    }

    ChatVisitorClass.LastListUpdate = 0;
    ChatVisitorClass.LastTimestampUpdate = 0;
    VisitorManager.UpdateUI = true;
    ChatVisitorClass.VisitorListCreated = false;
    for(var key in VisitorManager.Visitors)
        VisitorManager.Visitors[key].is_drawn = false;
    this.UpdateVisitorList();
};

ChatVisitorClass.prototype.UpdateVisitorList = function() {

    try
    {
        if(ChatVisitorClass.LastListUpdate > (lz_global_timestamp()-10) && !VisitorManager.UpdateUI)
            return;

        var that = this;
        ChatVisitorClass.LastListUpdate = lz_global_timestamp();

        this.FilterVisitors();
        VisitorManager.Calculate();
        this.UpdateInfoLine();
        VisitorManager.UpdateUI = false;

        var i, thisVisitorList = $('#visitor-list');
        var visitorListWidth = thisVisitorList.width();
        var visitors = VisitorManager.Visitors;

        if(!ChatVisitorClass.VisitorListCreated)
        {
            var extUserHtmlString = '<table id="visitor-list-table" class="visible-list-table alternating-rows-table lzm-unselectable"><thead><tr>';
            extUserHtmlString += '<th class="visitor_col_header">&nbsp;&nbsp;&nbsp;</th>';
            extUserHtmlString += '<th class="visitor_col_header">&nbsp;&nbsp;&nbsp;</th>';
            extUserHtmlString += '<th class="visitor_col_header">&nbsp;&nbsp;&nbsp;</th>';
            for (i=0; i<LocalConfiguration.TableColumns.visitor.length; i++)
                if (LocalConfiguration.TableColumns.visitor[i].display == 1)
                {
                    extUserHtmlString += '<th class="visitor_col_header" style="white-space: nowrap">' + t(LocalConfiguration.TableColumns.visitor[i].title) ;
                    if(LocalConfiguration.TableColumns.visitor[i].cid=='online')
                        extUserHtmlString += '&nbsp;&nbsp;&nbsp;<span style="position: absolute; right: 4px;"><i class="fa fa-caret-up"></i></span>';
                    extUserHtmlString += '</th>';
                }
            extUserHtmlString += '</tr></thead><tbody id="visitor-list-body">';
        }

        for (i = 0; i < visitors.length; i++)
        {
            if(!visitors[i].IsLoaded)
            {
                continue;
            }

            if (visitors[i].is_active && !visitors[i].IsHidden)
            {
                if(!visitors[i].is_drawn)
                {
                    if(!ChatVisitorClass.VisitorListCreated)
                        extUserHtmlString += that.CreateVisitorListLine(visitors[i], visitorListWidth, false, false);
                    else
                        $('#visitor-list-table').prepend(that.CreateVisitorListLine(visitors[i], visitorListWidth, true, false));

                    visitors[i].is_drawn = true;
                    visitors[i].is_vl_ui_update = false;
                }
                else if(visitors[i].is_vl_ui_update)
                {
                    var newLineHTML = that.CreateVisitorListLine(visitors[i], visitorListWidth, false, true);
                    $('#visitor-list-row-' + visitors[i].id).replaceWith(newLineHTML);
                    visitors[i].is_vl_ui_update = false;
                }
            }
            else
            {
                $('#visitor-list-row-' + visitors[i].id).addClass('visitor-list-line-removed');
                visitors[i].is_drawn = false;
            }

            if(LocalConfiguration.ShowVisitorsMap)
            {
                if(!d(visitors[i].is_mapped))
                    visitors[i].is_mapped = false;

                if(visitors[i].is_mapped && !(visitors[i].is_active && !visitors[i].IsHidden))
                {
                    lzm_chatGeoTrackingMap.removeVisitor(visitors[i].id);
                    visitors[i].is_mapped = false;
                }
                else if(!visitors[i].is_mapped && (visitors[i].is_active && !visitors[i].IsHidden))
                {
                    lzm_chatGeoTrackingMap.addOrQueueVisitor(visitors[i]);
                    visitors[i].is_mapped = true;
                }
            }
        }


        if(!ChatVisitorClass.VisitorListCreated)
        {
            extUserHtmlString += '</tbody></table>';
            $('#visitor-list-table-div').html(extUserHtmlString).trigger('create');
            ChatVisitorClass.VisitorListCreated = true;
        }
        else if (lzm_chatDisplay.selected_view == 'external')
        {
            $('.visitor-list-line-added').css({opacity:0});
            $('.visitor-list-line-added').animate({opacity:1});
        }

        if (lzm_chatDisplay.selected_view == 'external')
        {
            $('.visitor-list-line-updated').animate({opacity:0.5});
            $('.visitor-list-line-updated').animate({opacity:1});
            $('.visitor-list-line-removed').animate({opacity:0},1000);

            UIRenderer.ResizeVisitorList();
            ChatVisitorClass.__UpdateMap();
        }

        setTimeout(function(){
            $('.visitor-list-line-removed').remove();
            $('.visitor-list-line-added').removeClass('visitor-list-line-added');
            $('.visitor-list-line-updated').removeClass('visitor-list-line-updated');
        },1000);

        if(ChatVisitorClass.LastTimestampUpdate < (lz_global_timestamp()-60))
        {
            ChatVisitorClass.LastTimestampUpdate = lz_global_timestamp();
            this.UpdateVisitorTimestampCells();
        }

        $('.visitor_col_header').unbind("contextmenu");
        $('.visitor_col_header').contextmenu(function(){
            var cm = {id: 'visitors_header_cm',entries: [{label: tid('settings'),onClick : 'LocalConfiguration.__OpenTableSettings(\'visitors\')'}]};
            ContextMenuClass.BuildMenu(event,cm);
            return false;
        });
    }
    catch(ex)
    {
        deblog(ex);
    }
};

ChatVisitorClass.prototype.FilterVisitors = function() {

    if(lzm_commonPermissions.permissions.monitoring == 2)
        if(!LocalConfiguration.VisitorFilterHideInactive)
            if(DataEngine.getConfigValue('gl_vmac',false)=='1')
                if(DataEngine.getConfigValue('gl_hide_inactive',false)=='0')
                    if(DataEngine.getConfigValue('gl_doma',false)=='')
                        if(VisitorManager.HiddenVisitors == 0)
                            return;

    for(var key in VisitorManager.Visitors)
    {
        VisitorManager.SetVisitorHidden(VisitorManager.Visitors[key]);
    }
};

ChatVisitorClass.prototype.UpdateVisitorTimestampCells = function(elementId) {
    var that = this, i = 0;
    if (lzm_chatDisplay.selected_view == 'external' && $('#visitor-list-table').length)
    {
        var visitors = VisitorManager.Visitors;
        for (i=visitors.length-1; i>=0; i--)
        {
            if (visitors[i].is_active && visitors[i].is_drawn)
            {
                var timeColumns = that.getVisitorOnlineTimes(visitors[i]);
                $('#visitor-online-' + visitors[i].id).html(timeColumns['online']);
                $('#visitor-active-' + visitors[i].id).html(timeColumns['active']);
            }
        }
    }

    var infoUser = $('#visitor-details-'+elementId+'-list').data('visitor');
    if (typeof infoUser != 'undefined' && infoUser != null && $('#visitor-information').length > 0)
    {
        var tmpDate = that.calculateTimeDifference(infoUser, 'lastOnline', true);
        $('#visitor-online-since').html(tmpDate[0]);
        if (typeof (infoUser.b != 'undefined')) {
            for (i=0; i<infoUser.b.length; i++) {
                if (infoUser.b[i].is_active) {
                    var lastH = infoUser.b[i].h2.length - 1;
                    if (lastH >= 0) {
                        var lastBeginTimestamp = infoUser.b[i].h2[lastH].time;
                        var beginTime = lzm_chatTimeStamp.getLocalTimeObject(lastBeginTimestamp * 1000, true);
                        var endTime = lzm_chatTimeStamp.getLocalTimeObject();
                        var timeSpan = that.calculateTimeSpan(beginTime, endTime);
                        var beginTimeHuman = lzm_commonTools.getHumanDate(beginTime, 'shorttime', lzm_chatDisplay.userLanguage);
                        var endTimeHuman = lzm_commonTools.getHumanDate(endTime, 'shorttime', lzm_chatDisplay.userLanguage);
                        $('#visitor-history-last-'+elementId+'-timespan-b' + i).html(timeSpan);
                        $('#visitor-history-last-'+elementId+'-time-b' + i).html(beginTimeHuman + ' - ' + endTimeHuman);
                    }
                }
            }
        }
    }
};

ChatVisitorClass.prototype.UpdateInfoLine = function() {

    var gtclass = (parseInt(DataEngine.crc3[2])<0) ? 'ui-disabled' : '';
    var headline2String = '' +
        '<span class="left-button-list">' +
        lzm_inputControls.createButton('visitor-filter-btn', '', 'ChatVisitorClass.__SetVisitorFilter();','', '<i class="fa fa-filter"></i>', 'lr',{'margin-left': '4px','margin-right': '0px'}, '', 10) +
        '</span><span class="lzm-dialog-hl2-info">' +
        t('Visitors online: <!--visitor_number-->',[['<!--visitor_number-->', VisitorManager.ActiveVisitors]]) +
        '</span><span class="right-button-list">' +
        lzm_inputControls.createButton('visitors-map', gtclass, 'ChatVisitorClass.__UpdateMap(true);', 'Map', '<i class="fa fa-map-marker"></i>', 'lr', {'margin-right':'4px'}, '') +
        '</span>';

    $('#visitor-list-headline').html('<h3>' + tid('visitors') + '</h3>');
    $('#visitor-list-headline2').html(headline2String);
    lzm_chatDisplay.createViewSelectPanel();
};

ChatVisitorClass.prototype.CreateVisitorListLine = function(_visitorObj, visitorListWidth, newLine, updateLine) {

    var extUserHtmlString = '', i, j = 0, userStyle, that = this;

    if (IFManager.IsAppFrame)
    {
        userStyle = ' style="cursor: pointer; line-height: 22px !important;"';
    }
    else
    {
        userStyle = ' style="cursor: pointer;"';
    }

    var tableRowTitle = '';
    var visitorName = DataEngine.inputList.getInputValueFromVisitor(111,_visitorObj,32);
    var visitorEmail = DataEngine.inputList.getInputValueFromVisitor(112,_visitorObj,32);
    var visitorCity = (typeof _visitorObj.city != 'undefined' && _visitorObj.city.length > 32) ? _visitorObj.city.substring(0, 32) + '...' : (_visitorObj.city.length == 0) ? '-' : _visitorObj.city;
    var visitorPage = that.createVisitorPageString(_visitorObj);
    var visitorRegion = (typeof _visitorObj.region != 'undefined' && _visitorObj.region.length > 32) ? _visitorObj.region.substring(0, 32) + '...' : (_visitorObj.region.length == 0) ? '-' : _visitorObj.region;
    var visitorISP = (typeof _visitorObj.isp != 'undefined' && _visitorObj.isp.length > 32) ? _visitorObj.isp.substring(0, 32) + '...' : _visitorObj.isp;
    var visitorCompany = DataEngine.inputList.getInputValueFromVisitor(113,_visitorObj,32);
    var visitorSystem = (_visitorObj.sys.length > 32) ? _visitorObj.sys.substring(0, 32) + '...' : _visitorObj.sys;
    var visitorBrowser = (_visitorObj.bro.length > 32) ? _visitorObj.bro.substring(0, 32) + '...' : _visitorObj.bro;
    var visitorResolution = (_visitorObj.res.length > 32) ? _visitorObj.res.substring(0, 32) + '...' : _visitorObj.res;
    var visitorHost = (_visitorObj.ho.length > 32) ? _visitorObj.ho.substring(0,32) + '...' : _visitorObj.ho;
    var lastVisitedDate = lzm_chatTimeStamp.getLocalTimeObject(_visitorObj.vl * 1000, true);
    var visitorLastVisited = lzm_commonTools.getHumanDate(lastVisitedDate, 'full', lzm_chatDisplay.userLanguage);
    var visitorSearchStrings = (that.createVisitorStrings('ss', _visitorObj).length > 32) ? that.createVisitorStrings('ss', _visitorObj).substring(0, 32) + '...' : that.createVisitorStrings('ss', _visitorObj);
    var visitorOnlineSince = that.calculateTimeDifference(_visitorObj, 'lastOnline', false)[0];
    var visitorLastActivity = that.calculateTimeDifference(_visitorObj, 'lastActive', false)[0];
    var visitorInvitationStatus = '';
    var visitorInvitationLogo = 'img/632-skills_gray.png';
    var visitorInvitationFont = '<i class="fa icon-flip-hor fa-commenting"></i>';

    if (_visitorObj.r.length > 0)
    {
        var lInv = VisitorManager.GetLatestInvite(_visitorObj);
        if(lInv != null)
            if (lInv.s != '' && lInv.ca == '' && lInv.a == 0 && lInv.de == 0)
            {
                visitorInvitationStatus = 'requested';
                visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-orange"></i>';
            }
            else if(lInv.s != '' && lInv.a == '1')
            {
                visitorInvitationStatus = 'accepted';
                visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-green"></i>';
            }
            else if(lInv.s != '' && lInv.ca != '')
            {
                visitorInvitationStatus = 'revoked';
                visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-red"></i>';
            }
            else if(lInv.s != '' && lInv.de == '1')
            {
                visitorInvitationStatus = 'declined';
                visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-red"></i>';
            }
    }

    var visitorIsChatting = d(_visitorObj.IsInChat) ? _visitorObj.IsInChat : false;
    var onclickAction = '', oncontextmenuAction = '', ondblclickAction = '';

    if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
    {
        onclickAction = ' onclick="openVisitorListContextMenu(event, \'' + _visitorObj.id + '\', \'' + visitorIsChatting + '\', false, \'' + visitorInvitationStatus + '\', \'' + visitorInvitationLogo + '\');"';
    }
    else
    {
        onclickAction = ' onclick="selectVisitor(event, \'' + _visitorObj.id + '\');"';
        oncontextmenuAction = ' oncontextmenu="openVisitorListContextMenu(event, \'' + _visitorObj.id + '\', \'' + visitorIsChatting + '\', false, \'' + visitorInvitationStatus + '\');"';
        ondblclickAction = ' ondblclick="showVisitorInfo(\'' + _visitorObj.id + '\');"';
    }
    var langName = (typeof lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase()] != 'undefined') ?
        lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase()] :
        (typeof lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase().split('-')[0]] != 'undefined') ?
        lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase().split('-')[0]] :
        _visitorObj.lang;

    var columnContents = [{cid: 'online', contents: visitorOnlineSince, cell_id: 'visitor-online-' + _visitorObj.id},
        {cid: 'last_active', contents: visitorLastActivity, cell_id: 'visitor-active-' + _visitorObj.id},
        {cid: 'name', contents: visitorName},
        {cid: 'country', contents: lzm_chatDisplay.getCountryName(_visitorObj.ctryi2,false)},
        {cid: 'language', contents: langName},
        {cid: 'region', contents: visitorRegion},
        {cid: 'city', contents: visitorCity},
        {cid: 'page', contents: visitorPage},
        {cid: 'search_string', contents: visitorSearchStrings},
        {cid: 'website_name', contents: VisitorManager.GetWebsiteNames(_visitorObj)},
        {cid: 'host', contents: visitorHost},
        {cid: 'ip', contents: _visitorObj.ip}, {cid: 'email', contents: visitorEmail},
        {cid: 'company', contents: visitorCompany}, {cid: 'browser', contents: visitorBrowser},
        {cid: 'resolution', contents: visitorResolution},
        {cid: 'os', contents: visitorSystem},
        {cid: 'last_visit', contents: visitorLastVisited},
        {cid: 'isp', contents: visitorISP},
        {cid: 'visit_count', contents: _visitorObj.vts},
        {cid: 'page_title', contents: VisitorManager.GetPageTitle(_visitorObj)},
        {cid: 'page_count', contents: VisitorManager.GetPageCount(_visitorObj)},
        {cid: 'referrer', contents: VisitorManager.GetReferrer(_visitorObj)}
    ];

    LocalConfiguration.AddCustomBlock(columnContents);

    var css = 'visitor-list-line lzm-unselectable';

    if (newLine && ChatVisitorClass.VisitorListCreated)
        css += ' visitor-list-line-added';
    else if(updateLine && ChatVisitorClass.SelectedVisitor!=_visitorObj.id)
        css += ' visitor-list-line-updated';
    else if(ChatVisitorClass.SelectedVisitor==_visitorObj.id)
        css += ' selected-table-line';

    extUserHtmlString += '<tr' + userStyle + tableRowTitle + ' id="visitor-list-row-' + _visitorObj.id + '" data-user-id="' + _visitorObj.id + '" class="'+css+'"' + onclickAction + oncontextmenuAction + ondblclickAction +'>';

    var numberOfActiveInstances = 0;
    var activeInstanceNumber = 0;
    for (i=0; i<_visitorObj.b.length; i++)
    {
        if (_visitorObj.b[i].is_active && d(_visitorObj.b[i].h2) && _visitorObj.b[i].h2.length > 0)
        {
            numberOfActiveInstances++;
            activeInstanceNumber = i;
        }
    }
    extUserHtmlString += '<td class="icon-column nobg noibg"><div style="margin-top:-1px;background-image: url(\'./php/common/flag.php?cc=' + _visitorObj.ctryi2 + '\');" class="visitor-list-flag"></div></td>';
    if (visitorIsChatting)
        extUserHtmlString += '<td class="icon-column nobg noibg" style="padding-top: 2px;";><i class="fa fa-comments icon-orange"></i></td>';
    else
        extUserHtmlString += '<td class="icon-column nobg noibg" style="padding-top: 2px;"><i class="fa fa-comments"></i></td>';
    extUserHtmlString += '<td class="icon-column nobg noibg">'+visitorInvitationFont+'</td>';

    for (i=0; i<LocalConfiguration.TableColumns.visitor.length; i++) {
        for (j=0; j<columnContents.length; j++)
        {
            if (LocalConfiguration.TableColumns.visitor[i].cid == columnContents[j].cid && LocalConfiguration.TableColumns.visitor[i].display == 1)
            {
                if(!LocalConfiguration.IsCustom(columnContents[j].cid))
                {
                    var cellId = (typeof columnContents[j].cell_id != 'undefined') ? ' id="' + columnContents[j].cell_id + '"' : '';
                    extUserHtmlString += '<td' + cellId + '>' + columnContents[j].contents + '</td>';
                }
                else
                {
                    var cindex = columnContents[j].cid.replace('c','');
                    var customInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[cindex]);
                    if (customInput != null && customInput.active == 1)
                    {
                        extUserHtmlString += '<td>' + that.createCustomInputString(_visitorObj, customInput.id).replace(/-/g,'&#8209;').replace(/ /g,'&nbsp;') + '</td>';
                    }
                }
            }
        }
    }
    extUserHtmlString += '</tr>';
    return extUserHtmlString.replace(/<td><\/td>/g,'<td>-</td>');
};

ChatVisitorClass.prototype.getBrowserListHtml = function(visitor,elementId) {

    var brwsNo = 1, coBrowseSelBrws = '', coBrowseSelectOptions = '', firstActiveBrowser = '', activeBrowserPresent = false;
    for (var j=0; j<visitor.b.length; j++)
    {
        if (visitor.b[j].is_active && visitor.b[j].id.indexOf('_OVL')==-1)
        {
            activeBrowserPresent = true;
            firstActiveBrowser = (firstActiveBrowser == '') ? visitor.id + '~' + visitor.b[j].id : firstActiveBrowser;
            var lastH = visitor.b[j].h2[visitor.b[j].h2.length - 1];
            var lastHTime = lzm_chatTimeStamp.getLocalTimeObject(lastH.time * 1000, true);
            var lastHTimeHuman = lzm_commonTools.getHumanDate(lastHTime, 'shorttime', lzm_chatDisplay.userLanguage);
            var selectedString = '';
            if (visitor.id + '~' + visitor.b[j].id == $('#visitor-cobrowse-'+elementId+'-iframe').data('browser'))
            {
                selectedString = ' selected="selected"';
                coBrowseSelBrws = visitor.id + '~' + visitor.b[j].id;
            }
            coBrowseSelectOptions += '<option value="' + visitor.id + '~' + visitor.b[j].id + '"' + selectedString + '>' + t('Browser <!--brws_no-->: <!--brws_url--> (<!--brws_time-->)',[['<!--brws_no-->', brwsNo], ['<!--brws_url-->', lastH.url], ['<!--brws_time-->', lastHTimeHuman]]) + '</option>';
            brwsNo++;
        }
    }

    if(!activeBrowserPresent)
        coBrowseSelectOptions += '<option>' + tid('offline') + '</option>';

    coBrowseSelBrws = (coBrowseSelBrws != '') ? coBrowseSelBrws : firstActiveBrowser;

    return [coBrowseSelectOptions,coBrowseSelBrws,activeBrowserPresent];
};

ChatVisitorClass.prototype.updateCoBrowsingTab = function(thisUser, elementId) {

    var externalIsDisabled = (lzm_chatDisplay.myGroups.length > 0);
    for (var i=0; i<lzm_chatDisplay.myGroups.length; i++) {
        var myGr = DataEngine.groups.getGroup(lzm_chatDisplay.myGroups[i]);
        if (myGr != null && myGr.external == '1') {
            externalIsDisabled = false;
        }
    }

    var coBrowseSelectOptions = this.getBrowserListHtml(thisUser,elementId);

    /*
    if (!coBrowseSelectOptions[2])
        $('#visitor-cobrowse-'+elementId+'-iframe').data('browser', '');
    else
    */
        $('#visitor-cobrowse-'+elementId+'-iframe').data('browser', coBrowseSelectOptions[1]);

    $('#visitor-cobrowse-'+elementId+'-browser-select').html(coBrowseSelectOptions[0]);
    /*
    if (false && !coBrowseSelectOptions[2])
    {
        $('#visitor-cobrowse-'+elementId+'-browser-select').addClass('ui-disabled');
        $('#visitor-cobrowse-'+elementId+'-language-select').addClass('ui-disabled');
    }
    else
    {*/
        $('#visitor-cobrowse-'+elementId+'-browser-select').removeClass('ui-disabled');
    //}

    if ($('#visitor-cobrowse-'+elementId+'-iframe').length && $('#visitor-cobrowse-'+elementId+'-iframe').data('visible') == '1')
    {

        if (thisUser.id == $('#visitor-cobrowse-'+elementId+'-iframe').data('browser').split('~')[0])
        {
            var vb = VisitorManager.GetVisitorBrowser($('#visitor-cobrowse-'+elementId+'-iframe').data('browser'));
            if ($('#visitor-cobrowse-'+elementId+'-iframe').data('browser-url') != vb.h2[vb.h2.length - 1].url)
                ChatVisitorClass.__LoadCoBrowsingContent(elementId, vb);
        }
    }
};

ChatVisitorClass.prototype.ShowVisitorInformation = function (_visitorObj, chatId, activeTab, dialog, chatListing) {

    chatListing = (d(chatListing)) ? chatListing : false;

    var that = this, i, externalIsDisabled = (lzm_chatDisplay.myGroups.length > 0);
    for (i=0; i<lzm_chatDisplay.myGroups.length; i++)
    {
        var myGr = DataEngine.groups.getGroup(lzm_chatDisplay.myGroups[i]);
        if (myGr != null && myGr.external == '1')
            externalIsDisabled = false;
    }

    ChatVisitorClass.VisitorInformationId = _visitorObj.id;
    var now = lzm_chatTimeStamp.getServerTimeString(null, false, 1000);
    var elementId = ((dialog) ? 'd-' : 'e-') + _visitorObj.id;
    that.LastVisitorTimestampUpdate = now;
    lzm_chatDisplay.ShowVisitorId = _visitorObj.id;

    var visitorName = chatListing ? _visitorObj.unique_name : VisitorManager.GetVisitorName(_visitorObj);
    var headerString = chatListing ? visitorName : t('Visitor (<!--visitor_name-->)',[['<!--visitor_name-->', lzm_commonTools.htmlEntities(visitorName)]]);
    var footerString = lzm_inputControls.createButton('cancel-visitorinfo', '', '', t('Close'), '', 'lr',{'margin-left': '4px'},'',30,'d');
    var bodyString = '<div id="visitor-info-'+elementId+'-placeholder" class="dialog-visitor-info" data-visitor-id="'+_visitorObj.id+'"></div>';
    var dialogData = {'visitor-id': _visitorObj.id, menu: t('Visitor Information: <!--name-->', [['<!--name-->', lzm_commonTools.htmlEntities(visitorName)]]), 'chat-type': '1', 'reload': ['chats', 'tickets'], ratio: lzm_chatDisplay.DialogBorderRatioFull};

    if(dialog)
    {
        var dialogid = lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'visitor-information', {}, {}, {}, {}, '', dialogData, true, true);
        $('#visitor-information').data('dialog-id', dialogid);
    }

    var detailsHtml = '<div id="visitor-details-'+elementId+'-list" style="overflow-y: auto;" data-role="none">' + that.CreateVisitorInformationTable(_visitorObj, elementId) + '</div>';
    var historyHtml = '<div id="visitor-history-'+elementId+'-list" data-role="none"><div id="visitor-history-'+elementId+'-placeholder"></div></div>';
    var commentsHtml = '<div id="visitor-comment-'+elementId+'-list" data-role="none">' + that.createVisitorCommentTable(_visitorObj, elementId) + '</div>';
    var invitationsHtml = '<div id="visitor-invitation-'+elementId+'-list" data-role="none">' + that.createVisitorInvitationTable(_visitorObj, elementId) + '</div>';

    var brwsNo = 1, coBrowseSelBrws = '', coBrowseHtml = '';

    if (d(_visitorObj.b))
    {
        var myGroup, myself = DataEngine.operators.getOperator(lzm_chatDisplay.myId), firstLanguage = '', firstGroup = '';
        var defaultLanguage = '', defaultGroup = '';
        if (myself != null && typeof myself.pm != 'undefined') {
            for (i=0; i<myself.pm.length; i++) {
                if (myself.pm[i].def == 1)
                    defaultLanguage = (defaultLanguage == '') ? myself.pm[i].lang : defaultLanguage;
                if (myself.pm[i].lang == _visitorObj.lang)
                    firstLanguage = myself.pm[i].lang;
            }
        }
        for (i=0; i<lzm_chatDisplay.myGroups.length; i++) {
            myGroup = DataEngine.groups.getGroup(lzm_chatDisplay.myGroups[i]);
            if (firstLanguage == '' && myGroup != null && typeof myGroup.pm != 'undefined' && myGroup.pm.length > 0) {
                for (var j=0; j<myGroup.pm.length; j++) {
                    if (myGroup.pm[j].def == 1) {
                        defaultLanguage = (defaultLanguage == '') ? myGroup.pm[j].lang : defaultLanguage;
                        defaultGroup = myGroup.id;
                    }
                    if (myGroup.pm[j].lang == _visitorObj.lang) {
                        firstLanguage = myGroup.pm[j].lang;
                        firstGroup = myGroup.id;
                    }
                }
            }
        }
        defaultLanguage = (defaultLanguage != '') ? defaultLanguage : 'en';
        firstLanguage = (firstLanguage != '') ? firstLanguage : defaultLanguage;
        firstGroup = (firstGroup != '') ? firstGroup : defaultGroup;
        var grEncId = (firstGroup != '') ? '~' + lz_global_base64_url_encode(firstGroup) : '';
        coBrowseHtml = '<div class="lzm-fieldset top-space" data-role="none" id="visitor-cobrowse-'+elementId+'"><div id="visitor-cobrowse-'+elementId+'-inner"><div><select id="visitor-cobrowse-'+elementId+'-browser-select" class="lzm-select" data-role="none">';

        for (i=0; i<_visitorObj.b.length; i++)
        {
            if (_visitorObj.b[i].is_active && _visitorObj.b[i].last_browse > 0)
            {
                var lastH = _visitorObj.b[i].h2[_visitorObj.b[i].h2.length - 1];
                var lastHTime = lzm_chatTimeStamp.getLocalTimeObject(lastH.time * 1000, true);
                var lastHTimeHuman = lzm_commonTools.getHumanDate(lastHTime, 'shorttime', lzm_chatDisplay.userLanguage);
                coBrowseHtml += '<option value="' + _visitorObj.id + '~' + _visitorObj.b[i].id + '">' + t('Browser <!--brws_no-->: <!--brws_url--> (<!--brws_time-->)',[['<!--brws_no-->', brwsNo], ['<!--brws_url-->', lastH.url], ['<!--brws_time-->', lastHTimeHuman]]) + '</option>';
                if  (coBrowseSelBrws == '')
                    coBrowseSelBrws = _visitorObj.id + '~' + _visitorObj.b[i].id;
                brwsNo++;
            }
        }


        coBrowseHtml += '</select></div><div class="top-space">';
        if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
            coBrowseHtml += '<div id="visitor-cobrowse-'+elementId+'-iframe-container">'

        coBrowseHtml += '<iframe id="visitor-cobrowse-'+elementId+'-iframe" class="visitor-cobrowse-iframe" data-browser="' + coBrowseSelBrws + '" data-action="0" data-language="' + firstLanguage + '~group' + grEncId + '"></iframe>';

        if ((IFManager.IsAppFrame || IFManager.IsMobileOS) && !IFManager.IsDesktopApp())
            coBrowseHtml +='</div>';

        coBrowseHtml += '</div></div></div>';
    }

    var numberOfComments = (typeof _visitorObj.c != 'undefined') ? _visitorObj.c.length : 0;
    var numberOfInvites = (typeof _visitorObj.r != 'undefined') ? _visitorObj.r.length : 0;

    var tabsArray = (chatListing) ?
        [{name: t('Chats (<!--number_of_chats-->)', [['<!--number_of_chats-->', 0]]), content: ''}]
            :
        [{name: t('Details'), content: detailsHtml},
        {name: t('CoBrowse'), content: coBrowseHtml},
        {name: t('History (<!--number_of_histories-->)', [['<!--number_of_histories-->', 1]]), content: historyHtml},
        {name: t('Comments (<!--number_of_comments-->)', [['<!--number_of_comments-->', numberOfComments]]), content: commentsHtml},
        {name: t('Chat Invites (<!--number_of_invites-->)', [['<!--number_of_invites-->', numberOfInvites]]), content: invitationsHtml},
        {name: t('Chats (<!--number_of_chats-->)', [['<!--number_of_chats-->', 0]]), content: ''},
        {name: t('Tickets (<!--number_of_tickets-->)', [['<!--number_of_tickets-->', 0]]), content: ''}];

    try
    {
        lzm_displayHelper.createTabControl('visitor-info-'+elementId+'-placeholder', tabsArray, activeTab);
    }
    catch(e)
    {
        deblog(e);
        deblog(elementId);
    }

    $('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-id', dialogid);
    $('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-window', 'visitor-information');
    $('#matching-chats-'+elementId+'-inner-div').data('chat-dialog-data', dialogData);

    UIRenderer.resizeVisitorDetails();

    var selectedChatId = chatId;//$('#matching-chats-'+elementId+'-table').data('selected-chat-id');

    if (typeof selectedChatId != 'undefined')
        if (selectedChatId == '')
            $('#create-ticket-from-chat-' + elementId).addClass('ui-disabled');

    $('#visitor-info-'+elementId+'-placeholder-tab-5').addClass('ui-disabled');
    $('#visitor-info-'+elementId+'-placeholder-tab-6').addClass('ui-disabled');

    $('.visitor-info-'+elementId+'-placeholder-tab').click(function() {
        UIRenderer.resizeVisitorDetails();
        $(this).removeClass('lzm-tabs-message');
        var tabNo = $(this).data('tab-no');
        if (tabNo == 1)
        {
            $('#visitor-cobrowse-'+elementId+'-iframe').data('visible', '1');
            ChatVisitorClass.__LoadCoBrowsingContent(elementId);
        }
        else if (tabNo == 5)
        {
            if($('.archive-list-'+elementId+'-line').length)
            {
                if(!$('.archive-list-'+elementId+'-line selected-table-line').length)
                {
                    $('#matching-chats-'+elementId+'-table tr')[1].click();
                }
            }
        }
        else if (tabNo == 6)
        {
            if($('.ticket-list-row').length)
            {
                if(!$('.ticket-list-row selected-table-line').length)
                {
                    $('#matching-tickets-'+elementId+'-table tr')[1].click();
                }
            }
        }
        else
        {
            $('#visitor-cobrowse-'+elementId+'-iframe').data('visible', '0');
        }
    });

    if (activeTab == 1)
        $('#visitor-cobrowse-'+elementId+'-iframe').data('visible', '1');
    else
        $('#visitor-cobrowse-'+elementId+'-iframe').data('visible', '0');


    $('#create-ticket-from-chat-' + elementId).click(function() {
        if (lzm_commonPermissions.checkUserPermissions('', 'tickets', 'create_tickets', {}))
            showTicketDetails('', false, '', $('#matching-chats-'+elementId+'-table').data('selected-chat-id'), dialogid);
        else
            showNoPermissionMessage();
    });
    $('#send-chat-transcript-' + elementId).click(function() {
        var chatId = $('#matching-chats-'+elementId+'-table').data('selected-chat-id');
        if(!chatId)
            lzm_commonDialog.createAlertDialog(t('No element selected.'),null);
        else
            sendChatTranscriptTo(chatId, dialogid, 'visitor-information', dialogData);
    });
    $('#link-with-ticket-' + elementId).click(function() {
        var chatId = $('#matching-chats-'+elementId+'-table').data('selected-chat-id');
        if(!chatId)
            lzm_commonDialog.createAlertDialog(t('No element selected.'),null);
        else
            showTicketLinker('', chatId, null, 'chat', true, elementId);
    });
    $('#cancel-visitorinfo').click(function() {
        lzm_displayHelper.removeDialogWindow('visitor-information');
        lzm_chatDisplay.ShowVisitorId = '';
    });
    $('#visitor-cobrowse-'+elementId+'-browser-select').change(function() {
        $('#visitor-cobrowse-'+elementId+'-iframe').data('browser', $(this).val());
        ChatVisitorClass.__LoadCoBrowsingContent(elementId);
    });
    $('#visitor-details-'+elementId+'-list').data('visitor', _visitorObj);


    if(!d(_visitorObj.rv))
    {
        VisitorManager.LoadFullDataUserId = _visitorObj.id;
        VisitorManager.LoadFullDataChatsOnly = chatListing;
        CommunicationEngine.InstantPoll();
    }
    else
        this.UpdateVisitorInformation(_visitorObj,false);
};

ChatVisitorClass.prototype.UpdateVisitorInformation = function(thisUser,_chatListing) {

    _chatListing = (d(_chatListing)) ? _chatListing : false;

    try
    {
        var that = this;
        if(thisUser != null)
        {
            if(_chatListing)
            {
                var elementId = 'd-' + thisUser.id;
                var list = lzm_chatDisplay.archiveControlChats[thisUser.id];
                if(list.length > 0)
                {
                    $('#visitor-info-'+elementId+'-placeholder-tab-0').removeClass('ui-disabled');
                    var chatsHtml = lzm_chatDisplay.archiveDisplay.CreateMatchingChats(thisUser,list,elementId) + '<fieldset class="lzm-fieldset" data-role="none" style="margin:0;padding:0;" id="chat-content-'+elementId+'-inner"></fieldset>';
                    $('#visitor-info-'+elementId+'-placeholder-content-0').html(chatsHtml).trigger('create');

                    if($('#dialog-archive-list-'+elementId+'-line-'+ChatArchiveClass.SelectedChatId).length)
                        $('#dialog-archive-list-'+elementId+'-line-'+ChatArchiveClass.SelectedChatId).click();
                    else
                        $('#matching-chats-'+elementId+'-table tr')[1].click();

                    $('#visitor-info-'+elementId+'-placeholder-tab-0').html(t('Chats (<!--number_of_chats-->)', [['<!--number_of_chats-->', list.length]]));
                }
            }
            else
            {
                $(['d','e']).each(function()
                {
                    var elementId = $(this)[0].toString() + '-' + thisUser.id;

                    that.CreateHistoryTabControl(thisUser,elementId,$(this)[0].toString()=='d');

                    if($('#visitor-details-'+elementId+'-list').length)
                    {
                        $('#visitor-details-'+elementId+'-list').html(that.CreateVisitorInformationTable(thisUser,elementId)).trigger('create');
                        $('#visitor-history-'+elementId+'-placeholder-content-0').html(that.CreateBrowserHistory(thisUser,elementId)).trigger('create');

                        if(d(thisUser.rv))
                            for (var i=0; i<thisUser.rv.length; i++)
                            {
                                var recentHistoryHtml = that.CreateBrowserHistory(thisUser, elementId, thisUser.rv[i]);
                                $('#recent-history-'+elementId+'-' + thisUser.rv[i].id).replaceWith(recentHistoryHtml);
                            }

                        $('#visitor-comment-'+elementId+'-list').html(that.createVisitorCommentTable(thisUser, elementId)).trigger('create');
                        $('#visitor-invitation-'+elementId+'-list').html(that.createVisitorInvitationTable(thisUser, elementId)).trigger('create');
                        that.updateCoBrowsingTab(thisUser, elementId);

                        var numberOfHistories = (d(thisUser.rv)) ? thisUser.rv.length + 1 : 1;
                        var numberOfComments = (d(thisUser.c)) ? thisUser.c.length : 0;
                        var numberOfInvites = thisUser.r.length;
                        var numberOfChats = (d(thisUser.ArchivedChats)) ? thisUser.ArchivedChats.length : 0;
                        var numberOfTickets = (d(thisUser.ArchivedTickets)) ? thisUser.ArchivedTickets.length : 0;

                        $('#visitor-info-'+elementId+'-placeholder-tab-2').html(t('History (<!--number_of_histories-->)', [['<!--number_of_histories-->', numberOfHistories]]));
                        $('#visitor-info-'+elementId+'-placeholder-tab-3').html(t('Comments (<!--number_of_comments-->)', [['<!--number_of_comments-->', numberOfComments]]));
                        $('#visitor-info-'+elementId+'-placeholder-tab-4').html(t('Chat Invites (<!--number_of_invites-->)', [['<!--number_of_invites-->', numberOfInvites]]));
                        $('#visitor-info-'+elementId+'-placeholder-tab-5').html(t('Chats (<!--number_of_chats-->)', [['<!--number_of_chats-->', numberOfChats]]));
                        $('#visitor-info-'+elementId+'-placeholder-tab-6').html(t('Tickets (<!--number_of_tickets-->)', [['<!--number_of_tickets-->', numberOfTickets]]));

                        $('#visitor-info-'+elementId+'-placeholder-tab-0').removeClass('ui-disabled');
                        $('#visitor-info-'+elementId+'-placeholder-tab-1').removeClass('ui-disabled');
                        $('#visitor-info-'+elementId+'-placeholder-tab-2').removeClass('ui-disabled');
                        $('#visitor-info-'+elementId+'-placeholder-tab-3').removeClass('ui-disabled');
                        $('#visitor-info-'+elementId+'-placeholder-tab-4').removeClass('ui-disabled');

                        if(numberOfChats > 0 && !$('#visitor-info-'+elementId+'-placeholder-content-5').html().length)
                        {
                            $('#visitor-info-'+elementId+'-placeholder-tab-5').removeClass('ui-disabled');
                            var chatsHtml = lzm_chatDisplay.archiveDisplay.CreateMatchingChats(thisUser,thisUser.ArchivedChats,elementId) + '<fieldset class="lzm-fieldset" data-role="none" style="margin:0;padding:0;" id="chat-content-'+elementId+'-inner"></fieldset>';
                            $('#visitor-info-'+elementId+'-placeholder-content-5').html(chatsHtml).trigger('create');

                            if($('#visitor-info-'+elementId+'-placeholder-tab-5').hasClass('lzm-tabs-selected'))
                                $('#visitor-info-'+elementId+'-placeholder-tab-5').click();
                        }

                        if(numberOfTickets > 0 && !$('#visitor-info-'+elementId+'-placeholder-content-6').html().length)
                        {
                            $('#visitor-info-'+elementId+'-placeholder-tab-6').removeClass('ui-disabled');
                            var ticketsHtml = lzm_chatDisplay.ticketDisplay.createMatchingTickets(thisUser.ArchivedTickets,elementId) + '<fieldset class="lzm-fieldset" data-role="none" style="margin:0;" id="ticket-content-'+elementId+'-inner"></fieldset>';
                            $('#visitor-info-'+elementId+'-placeholder-content-6').html(ticketsHtml).trigger('create');

                            if($('#visitor-info-'+elementId+'-placeholder-tab-6').hasClass('lzm-tabs-selected'))
                                $('#visitor-info-'+elementId+'-placeholder-tab-6').click();
                        }
                        $('#visitor-details-'+elementId+'-list').data('visitor', lzm_commonTools.clone(thisUser));
                    }
                });
            }
            UIRenderer.resizeVisitorDetails();
        }
    }
    catch(ex)
    {
        deblog(ex);
    }
};

ChatVisitorClass.prototype.CreateHistoryTabControl = function(_visitorObj, elementId, dialog){
    var currentHistory = this.CreateBrowserHistory(_visitorObj, elementId);
    var historyTabsArray = [{name: tid('active'), content: currentHistory, hash: md5('Active')}];
    if (typeof _visitorObj.rv != 'undefined')
    {
        for (i=0; i<_visitorObj.rv.length; i++)
        {
            var date = lzm_chatTimeStamp.getLocalTimeObject(_visitorObj.rv[i].e * 1000, true);
            var humanDate = lzm_commonTools.getHumanDate(date, 'all', lzm_chatDisplay.userLanguage);
            var recentHistoryHtml = this.CreateBrowserHistory(_visitorObj, elementId, _visitorObj.rv[i]);
            historyTabsArray.push({name: humanDate, content: recentHistoryHtml, hash: _visitorObj.rv[i].id});
        }
    }
    var tabControlWidth = ((dialog) ? $('#visitor-information').width() : $('#chat-info-body').width()) - 37;
    lzm_displayHelper.createTabControl('visitor-history-'+elementId+'-placeholder', historyTabsArray, 0, tabControlWidth);
};

ChatVisitorClass.prototype.CreateVisitorInformationTable = function(_visitorObj, elementId) {
    var visitorInfoHtml = '', visitorInfoArray, that = this;
    if (_visitorObj.is_active)
    {
        var visitorName = DataEngine.inputList.getInputValueFromVisitor(111,_visitorObj);
        var visitorEmail = DataEngine.inputList.getInputValueFromVisitor(112,_visitorObj);
        var visitorCompany = DataEngine.inputList.getInputValueFromVisitor(113,_visitorObj);
        var visitorPhone = DataEngine.inputList.getInputValueFromVisitor(116,_visitorObj);
        var visitorPage = that.createVisitorPageString(_visitorObj);
        var visitorSearchString = that.createVisitorStrings('ss', _visitorObj);
        var lastVisitedDate = lzm_chatTimeStamp.getLocalTimeObject(_visitorObj.vl * 1000, true);
        var visitorLastVisit = lzm_commonTools.getHumanDate(lastVisitedDate, 'full', lzm_chatDisplay.userLanguage);
        var tmpDate = that.calculateTimeDifference(_visitorObj, 'lastOnline', true);
        var onlineTime = '<span id="visitor-online-since">' + tmpDate[0] + '</span>';
        tmpDate = lzm_chatTimeStamp.getLocalTimeObject(tmpDate[1]);
        var humanDate = lzm_commonTools.getHumanDate(tmpDate, 'all', lzm_chatDisplay.userLanguage);
        var visitorAreas = VisitorManager.GetWebsiteNames(_visitorObj);
        var visitorJavascript = (_visitorObj.js == '1') ? t('Yes') : t('No');
        var pagesBrowsed = 0;

        for (var l=0; l<_visitorObj.b.length; l++)
            if(d(_visitorObj.b[l].h2))
                for (var m=0; m<_visitorObj.b[l].h2.length; m++)
                    pagesBrowsed += 1;

        var visitorStatus = t('<!--status_style_begin-->Online<!--status_style_end-->',[['<!--status_style_begin-->',''],['<!--status_style_end-->','']]);
        var visitorIsChatting = false;
        for (var glTypInd=0; glTypInd<DataEngine.global_typing.length; glTypInd++) {
            if (DataEngine.global_typing[glTypInd].id.indexOf('~') != -1 &&
                DataEngine.global_typing[glTypInd].id.split('~')[0] == _visitorObj.id) {
                visitorIsChatting = true;
                break;
            }
        }
        var visitorWasDeclined = true;
        var chatPartners = [];
        if (visitorIsChatting) {
            for (var bInd=0; bInd<_visitorObj.b.length; bInd++)
                if (typeof _visitorObj.b[bInd].chat.pn != 'undefined' && _visitorObj.b[bInd].chat.status != 'left')
                    for (var mInd=0; mInd<_visitorObj.b[bInd].chat.pn.member.length; mInd++) {
                        if (_visitorObj.b[bInd].chat.pn.member[mInd].dec == 0 && _visitorObj.b[bInd].chat.pn.member[mInd].st != 2) {
                            visitorWasDeclined = false;
                            chatPartners.push({oid:_visitorObj.b[bInd].chat.pn.member[mInd].id,cid:_visitorObj.b[bInd].chat.id});
                            break;
                        }
                    }
        }
        else
            visitorWasDeclined = false;

        var langName = (typeof lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase()] != 'undefined') ?
            _visitorObj.lang + ' - ' + lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase()] :
            (typeof lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase().split('-')[0]] != 'undefined') ?
            _visitorObj.lang + ' - ' + lzm_chatDisplay.availableLanguages[_visitorObj.lang.toLowerCase().split('-')[0]] :
            _visitorObj.lang;

        var countryName = lzm_chatDisplay.getCountryName(_visitorObj.ctryi2,true);

        visitorInfoArray = {
            details: {title: t('Visitor Details'), rows: [
                {title: t('Status'), content: visitorStatus},
                {title: t('Name'), content: visitorName, editable: true, editkey: '111'},
                {title: t('Email'), content: visitorEmail, editable: true, editkey: '112'},
                {title: t('Company'), content: visitorCompany, editable: true, editkey: '113'},
                {title: t('Phone'), content: visitorPhone, editable: DataEngine.inputList.getCustomInput('116').active=='1', editkey: '116'},
                {title: t('Language'), content: langName, editable: false}
            ]},
            location: {title: t('Location'), rows: [
                {title: t('City'), content: _visitorObj.city, editable: false},
                {title: t('Region'), content: _visitorObj.region, editable: false},
                {title: t('Country'), content_icon: '<div style="background-image: url(\'./php/common/flag.php?cc=' + _visitorObj.ctryi2 + '\');display:inline-block;" class="visitor-list-flag"></div>', content:countryName, editable: false},
                {title: t('Time Zone'), content: t('GMT <!--tzo-->', [['<!--tzo-->', _visitorObj.tzo]]), editable: false}
            ]},
            device: {title: t('Visitor\'s Computer / Device'), rows: [
                {title: t('Resolution'), content: _visitorObj.res, editable: false},
                {title: t('Operating system'), content: _visitorObj.sys, editable: false},
                {title: t('Browser'), content: _visitorObj.bro, editable: false},
                {title: t('Javascript'), content: visitorJavascript, editable: false},
                {title: t('IP address'), content: _visitorObj.ip, editable: false},
                {title: t('Host'), content: _visitorObj.ho, editable: false},
                {title: t('ISP'), content: _visitorObj.isp, editable: false},
                {title: t('User ID'), content: _visitorObj.id, editable: false}
            ]},
            misc: {title: t('Misc'), rows: [
                {title: t('Date'), content: humanDate, editable: false},
                {title: t('Online Time'), content: onlineTime, editable: false},
                {title: t('Website Name'), content: visitorAreas, editable: false},
                {title: t('Search string'), content: visitorSearchString, editable: false},
                {title: t('Page'), content: visitorPage, editable: false},
                {title: t('Pages browsed'), content: pagesBrowsed, editable: false},
                {title: t('Visits'), content: _visitorObj.vts, editable: false},
                {title: t('Last Visit'), content: visitorLastVisit, editable: false}
            ]}
        };
        if (visitorIsChatting && !visitorWasDeclined)
        {
            visitorInfoArray.chat = {title: tid('chat'), rows: []};
            visitorInfoArray.chat.rows.push({title: tid('type'), content: (true) ? 'On-Site' : 'Off-Site'});
            if(chatPartners.length > 1)
            {
                var cphtml = '';
                for (var i=0; i<chatPartners.length; i++) {
                    var operator = DataEngine.operators.getOperator(chatPartners[i].oid);
                    if (operator != null)
                        cphtml += chatPartners[i].cid + ' - ' + operator.name + '<br>';

                }
                visitorInfoArray.chat.rows.push({title: tid('active_chats_button'), content: cphtml, class:'text-info',icon:'warning'});
            }
        }
    }
    else
    {
        visitorStatus = t('<!--status_style_begin-->Offline<!--status_style_end-->',[['<!--status_style_begin-->','<span style="color:#aa0000; font-weight: bold;">'],['<!--status_style_end-->','</span>']]);
        visitorInfoArray = {details: {title: t('Visitor Details'), rows: [{title: t('Status'), content: visitorStatus},{title: t('Name'), content: lzm_commonTools.htmlEntities(_visitorObj.unique_name)}]}};
    }

    for (var myKey in visitorInfoArray) {
        if (visitorInfoArray.hasOwnProperty(myKey)) {
            visitorInfoHtml += '<table id="visitor-info-table" class="visible-list-table alternating-rows-table"><thead><tr class="split-table-line"><td colspan="4"><b>' + visitorInfoArray[myKey].title + '</b></td></tr></thead><tbody>';
            for (var k=0; k<visitorInfoArray[myKey].rows.length; k++) {
                var contentString = (visitorInfoArray[myKey].rows[k].content != '') ? visitorInfoArray[myKey].rows[k].content : '-';
                var contentIcon = d(visitorInfoArray[myKey].rows[k].content_icon) ? visitorInfoArray[myKey].rows[k].content_icon : '';
                var cssClass = (d(visitorInfoArray[myKey].rows[k].class)) ? ' class="' + visitorInfoArray[myKey].rows[k].class + '"' : '';
                visitorInfoHtml += '<tr>' +
                    '<td'+cssClass+'>' + visitorInfoArray[myKey].rows[k].title + '</td>' +
                    '<td'+cssClass+'>'+contentIcon+'</td>' +
                    '<td'+cssClass+'>' + contentString + '</td>';

                    if(visitorInfoArray[myKey].rows[k].editable)
                        visitorInfoHtml += '<td'+cssClass+'><a href="#" onclick="editVisitorDetails(\''+_visitorObj.id+'\',\''+visitorInfoArray[myKey].rows[k].editkey+'\',\''+elementId+'\');"><i class="fa fa-edit"></i></a></td></tr>';
                    else if(d(visitorInfoArray[myKey].rows[k].icon))
                        visitorInfoHtml +='<td'+cssClass+'><i class="fa fa-'+visitorInfoArray[myKey].rows[k].icon+' icon-red"></i></td></tr>';
                    else
                        visitorInfoHtml +='<td'+cssClass+'></td></tr>';
            }
            visitorInfoHtml += '</tbody></table>';
        }
    }
    return visitorInfoHtml;
};

ChatVisitorClass.prototype.CreateBrowserHistory = function (visitor, elementId, rv) {
    var that = this;
    var containerDivId = (typeof rv != 'undefined') ? ' id="recent-history-'+elementId+'-' + rv.id + '"' : '';
    var browserHistoryHtml = '<div' + containerDivId + ' class="browser-history-container" style="overflow-y: auto;height:100%;">' +
        '<table class="browser-history visible-list-table alternating-rows-table lzm-unselectable" style="margin-top:1px;">' +
        '<thead><tr>' +
        '<th style="width: 1px !important;" nowrap></th>' +
        '<th nowrap>' + t('Time') + '</th>' +
        '<th nowrap>' + t('Time span') + '</th>' +
        '<th nowrap>' + tid('website_name') + '</th>' +
        '<th nowrap>' + t('Title') + '</th>' +
        '<th nowrap>' + t('Url') + '</th>' +
        '<th nowrap>' + t('Referrer') + '</th>' +
        '</tr></thead><tbody>';

    var lineCounter = 0;
    var browserCounter = 1;

    try
    {
        var browserList = d(rv) ? (rv.b) : (d(visitor.b) ? (visitor.b) : null);
        if(browserList != null)
            for (var i = 0; i < browserList.length; i++)
            {
                if (d(browserList[i].h2) && browserList[i].h2.length > 0)
                {
                    browserHistoryHtml += '<tr class="split-table-line"><td colspan="7"><b>'+tid('browser') + ' ' + (i+1)+'</b></td></tr>';

                    for (var j = 0; j < browserList[i].h2.length; j++)
                    {
                        var browserIcon = 'icon-light';
                        var beginTime = lzm_chatTimeStamp.getLocalTimeObject(browserList[i].h2[j].time * 1000, true);
                        var beginTimeHuman = lzm_commonTools.getHumanDate(beginTime, 'shorttime', lzm_chatDisplay.userLanguage);
                        var endTime = lzm_chatTimeStamp.getLocalTimeObject();

                        if (browserList[i].h2.length > (j + 1))
                            endTime = lzm_chatTimeStamp.getLocalTimeObject(browserList[i].h2[j + 1].time * 1000, true);

                        var endTimeHuman = lzm_commonTools.getHumanDate(endTime, 'shorttime', lzm_chatDisplay.userLanguage);
                        var timeSpan = that.calculateTimeSpan(beginTime, endTime);
                        var referer = '';

                        if (j == 0)
                        {
                            referer = browserList[i].h2[j].ref.u;
                        }

                        if (j > 0)
                        {
                            try
                            {
                                referer = browserList[i].h2[j - 1].url;
                            }
                            catch(ex)
                            {
                                deblog(ex);
                            }
                        }

                        if (typeof rv == 'undefined' && browserList[i].is_active && j == browserList[i].h2.length - 1)
                            browserIcon = 'icon-green';

                        var externalPageUrl = '';
                        try
                        {
                            externalPageUrl = browserList[i].h2[j].url;
                        }
                        catch(ex) {}

                        var refererLink = (referer != '') ? '<a class="lz_chat_link_no_icon" href="#" onclick="openLink(\'' + referer + '\')">' + referer : '';
                        var chatPageString = '';
                        var lastTimeSpanId = (j == browserList[i].h2.length - 1) ? ' id="visitor-history-'+elementId+'-last-timespan-b' + i + '"' : '';
                        var lastTimeId = (j == browserList[i].h2.length - 1) ? ' id="visitor-history-'+elementId+'-last-time-b' + i + '"' : '';

                        browserHistoryHtml += '<tr class="lzm-unselectable">' +
                            '<td class="icon-column"><span class="fa fa-globe table-icon '+browserIcon+'"></span></td>' +
                            '<td nowrap' + lastTimeId + '>' + beginTimeHuman + ' - ' + endTimeHuman + '</td>' +
                            '<td nowrap' + lastTimeSpanId + '>' + timeSpan + '</td>' +
                            '<td nowrap>' + browserList[i].h2[j].code + chatPageString + '</td>' +
                            '<td nowrap>' + browserList[i].h2[j].title + '</td>' +
                            '<td nowrap><a class="lz_chat_link_no_icon" href="#" onclick="openLink(\'' + externalPageUrl + '\')">' + externalPageUrl + '</a></td>' +
                            '<td nowrap>' + refererLink + '</a></td>' +
                            '</tr>';
                        lineCounter++;
                    }
                    browserCounter++;
                }

            }
    }
    catch(e)
    {
        deblog(e);
    }
    browserHistoryHtml += '</tbody></table></div>';

    return browserHistoryHtml;
};

ChatVisitorClass.prototype.createVisitorCommentTable = function(visitor, elementId) {
    var userName = (typeof visitor.name != 'undefined' && visitor.name != '') ? visitor.name : visitor.unique_name;
    var menuEntry = t('Visitor Information: <!--name-->', [['<!--name-->', userName]]);
    var commentTableHtml = '<div class="lzm-dialog-headline3" style="margin-top:1px;">' + lzm_inputControls.createButton('add-comment', '', 'addVisitorComment(\'' + visitor.id + '\', \'' + menuEntry + '\')', t('Add Comment'), '<i class="fa fa-plus"></i>', 'lr', {'margin-right':'4px',float:'right'}, t('Add Comment'),'','b') + '</div><div id="visitor-comment-'+elementId+'-list-frame" style="overflow-y:auto;"><table class="visible-list-table alternating-rows-table lzm-unselectable" id="visitor-comment-'+elementId+'-table" style="width: 100%;"><tbody>';
    try {
        if(visitor.c)
            for (var i=0; i<visitor.c.length; i++) {
                var operator = DataEngine.operators.getOperator(visitor.c[i].o);
                var commentText = visitor.c[i].text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n/g, '<br />');
                commentTableHtml += lzm_chatDisplay.createCommentHtml('visitor',i,commentText,operator.name,operator.id,lzm_commonTools.getHumanDate(lzm_chatTimeStamp.getLocalTimeObject(visitor.c[i].c * 1000, true), 'all', lzm_chatDisplay.userLanguage));
            }
    } catch(e) {deblog(e);}
    commentTableHtml += '</tbody></table></div>';
    return commentTableHtml;
};

ChatVisitorClass.prototype.createVisitorInvitationTable = function(visitor, elementId) {
    var operator;
    var invitationTableHtml = '<table class="visible-list-table alternating-rows-table lzm-unselectable" id="visitor-invitation-'+elementId+'-table" style="margin-top:1px;width: 100%";>' +
        '<thead><tr>' +
        '<th style="width: 8px !important; padding-left: 11px; padding-right: 11px;"></th>' +
        '<th>' + t('Date') + '</th>' +
        '<th>' + tid('sender') + '</th>' +
        '<th>' + t('Event') + '</th>' +
        '<th>' + t('Shown') + '</th>' +
        '<th>' + t('Accepted') + '</th>' +
        '<th>' + t('Declined') + '</th>' +
        '<th>' + t('Canceled') + '</th>' +
        '</tr></thead><tbody>';
    try
    {

        for (var i=0; i<visitor.r.length; i++) 
        {
            var visitorInvitationFont = '<i class="fa icon-flip-hor fa-commenting"></i>';
            if (visitor.r.length > 0)
            {
                if (visitor.r[i].s != '' && visitor.r[i].ca == '' && visitor.r[i].a == 0 && visitor.r[i].de == 0){
                    visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-orange"></i>';
                }
                else if(visitor.r[i].s != '' && visitor.r[i].a == '1') {
                    visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-green"></i>';
                } else if(visitor.r[i].s != '' && visitor.r[i].ca != '') {
                    visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-red"></i>';
                } else if(visitor.r[i].s != '' && visitor.r[i].de == '1') {
                    visitorInvitationFont = '<i class="fa fa-commenting icon-flip-hor icon-red"></i>';
                }
            }

            var tmpDate = lzm_chatTimeStamp.getLocalTimeObject(visitor.r[i].c * 1000, true);
            var timeHuman = lzm_commonTools.getHumanDate(tmpDate, 'all', lzm_chatDisplay.userLanguage);
            var operatorName = '';
            try {
                operator = DataEngine.operators.getOperator(visitor.r[i].s);
                operatorName = (operator != null) ? operator.name : '';
            } catch(e) {}
            var myEvent = (visitor.r[i].e != '') ? visitor.r[i].e : '-';

            if(myEvent != '')
            {
                for(var key in DataEngine.eventList)
                    for(var akey in DataEngine.eventList[key].Actions)
                        if(DataEngine.eventList[key].Actions[akey].id == visitor.r[i].e)
                        {
                            myEvent = DataEngine.eventList[key].name;
                        }

            }

            var isShown = (visitor.r[i].d == "1") ? t('Yes') : t('No');
            var isAccepted = (visitor.r[i].a == "1" && visitor.r[i].ca == "") ? t('Yes') : t('No');
            var isDeclined = (visitor.r[i].de == "1") ? t('Yes') : t('No');
            var isCanceled = (visitor.r[i].ca != "") ? t('Yes (<!--op_name-->)', [['<!--op_name-->', t('Timeout')]]) : t('No');
            try {
                operator = DataEngine.operators.getOperator(visitor.r[i].ca);
                isCanceled = (visitor.r[i].ca != "") ? t('Yes (<!--op_name-->)', [['<!--op_name-->', operator.name]]) : t('No');
            } catch(e) {}
            invitationTableHtml += '<tr class="lzm-unselectable">' +
                '<td style="text-align:center;">'+visitorInvitationFont+'</td>' +
                '<td>' + timeHuman + '</td>' +
                '<td>' + operatorName + '</td>' +
                '<td>' + myEvent + '</td>' +
                '<td>' + isShown + '</td>' +
                '<td>' + isAccepted + '</td>' +
                '<td>' + isDeclined + '</td>' +
                '<td>' + isCanceled + '</td>' +
                '</tr>';
        }
    } catch(e) {}
    invitationTableHtml += '</tbody></table>';

    return invitationTableHtml;
};

ChatVisitorClass.prototype.addVisitorComment = function(visitorId, menuEntry) {
    var commentControl = lzm_inputControls.createArea('new-comment-field', '', '', tid('comment') + ':','width:300px;height:75px;');
    lzm_commonDialog.createAlertDialog(commentControl, [{id: 'ok', name: tid('ok')},{id: 'cancel', name: tid('cancel')}],false,true,false);
    $('#new-comment-field').select();
    $('#alert-btn-ok').click(function() {
        var commentText = $('#new-comment-field').val();
        UserActions.saveVisitorComment(visitorId, commentText);
        lzm_commonDialog.removeAlertDialog();
    });
    $('#alert-btn-cancel').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
};

ChatVisitorClass.prototype.editVisitorDetails = function(visitorId,field,elementId){
    var visitor = VisitorManager.GetVisitor(visitorId);
    var hidden = ['114'], selectedField, value;
    var inputForm = '<fieldset class="lzm-fieldset"><legend>' + tid('edit') + '</legend>', input='',inputss='',inputsc='';
    for (var i=0; i<DataEngine.inputList.idList.length; i++) {
        var myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[i]);
        if (myCustomInput.active == 1 && $.inArray(myCustomInput.id,hidden) == -1) {
            value = DataEngine.inputList.getInputValueFromVisitor(myCustomInput.id,visitor,null,true);
            if(myCustomInput.id==field)
                selectedField = myCustomInput.id;
            input = '<div class="top-space">' + DataEngine.inputList.getControlHTML(myCustomInput,'evd-'+elementId+'-' + visitorId + myCustomInput.id, 'evd-'+elementId + '-' + visitorId,value) + '</div>';

            if(myCustomInput.id<111)
                inputsc += input;
            else
                inputss += input;
        }
    }
    inputForm += inputss + inputsc + '</fieldset>';
    lzm_commonDialog.createAlertDialog(inputForm, [{id: 'evd-ok', name: t('Ok')}, {id: 'evd-cancel', name: t('Cancel')}]);
    $('#evd-'+elementId+'-' + visitorId + selectedField).select();
    $('#alert-btn-evd-ok').click(function() {
        var newData = {p_vi_id:visitorId};
        for (var i=0; i<DataEngine.inputList.idList.length; i++) {
            var myCustomInput = DataEngine.inputList.getCustomInput(DataEngine.inputList.idList[i]);
            if (myCustomInput.active == 1 && $.inArray(myCustomInput.id,hidden) == -1) {
                var id = 'evd-'+elementId+'-' + visitorId + myCustomInput.id;
                newData['p_f' + myCustomInput.id] = lz_global_base64_url_encode(DataEngine.inputList.getControlValue(myCustomInput,id));
            }
        }
        CommunicationEngine.pollServerSpecial(newData, 'set_visitor_details');
        $('#alert-btn-evd-cancel').click();
    });
    $('#alert-btn-evd-cancel').click(function() {
        lzm_commonDialog.removeAlertDialog();
    });
};

ChatVisitorClass.prototype.showVisitorInvitation = function(aVisitor) {
    var that = this;

    if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        messageEditor = new ChatEditorClass('invitation-text');

    var text = '';
    var footerString =
        lzm_inputControls.createButton('send-invitation', 'ui-disabled', '', t('Ok'), '', 'lr',{'margin-left': '4px'},'',30,'d') +
        lzm_inputControls.createButton('cancel-invitation', '', '', t('Cancel'), '', 'lr',{'margin-left': '4px'},'',30,'d');

    var dialogData = {editors: [{id: 'invitation-text', instanceName: 'messageEditor'}], 'visitor-id': aVisitor.id};

    lzm_displayHelper.createDialogWindow(t('Chat Invitation'), that.createVisitorInvitation(aVisitor), footerString, 'chat-invitation', {}, {}, {}, {}, '', dialogData);

    $('#invitation-text-inner').addClass('lzm-text-input-inner');
    $('#invitation-text').css({border:0});

    if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        $('#invitation-text-controls').addClass('lzm-text-input-controls');
    else
        $('#invitation-text-controls').addClass('lzm-text-input-controls-mobile');

    if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        $('#invitation-text-body').addClass('lzm-text-input-body');

    text = UserActions.getChatPM(null, aVisitor.id, $('#browser-selection').val(), 'invm', $('#language-selection').val().split('---')[0],$('#group-selection').val())['invm'];
    if ((!IFManager.IsMobileOS && !IFManager.IsAppFrame) || IFManager.IsDesktopApp())
        messageEditor.init(text, 'showVisitorInvitation');
    else
        $('#invitation-text').html(text);

    $('#language-selection').change(function() {
        var selLanguage = $('#language-selection').val().split('---')[0];
        var selGroup = '';
        if ($('#language-selection').val().split('---')[1] == 'group')
        {
            selGroup = $('#group-selection').val();
        }
        try
        {

            text = UserActions.getChatPM(null, aVisitor.id, $('#browser-selection').val(), 'invm', selLanguage, selGroup)['invm'];
        }
        catch(e)
        {
            text = '';
        }
        if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        {
            messageEditor.setHtml(text);
        }
        else
        {
            $('#invitation-text').html(text);
        }
    });
    $('#group-selection').change(function(){
        var selLanguage = $('#language-selection').val().split('---')[0];
        var selGroup = '';

        if ($('#language-selection').val().split('---')[1] == 'group')
        {
            selGroup = $('#group-selection').val();
        }

        try
        {
            text = UserActions.getChatPM(null, aVisitor.id, $('#browser-selection').val(), 'invm', selLanguage, selGroup)['invm'];
        }
        catch (e)
        {
            text = '';
        }

        if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp())
        {
            messageEditor.setHtml(text);
        }
        else
        {
            $('#invitation-text').html(text);
        }
    });

    if ($('#browser-selection').val() != -1)
        $('#send-invitation').removeClass('ui-disabled');
    else
        $('#send-invitation').addClass('ui-disabled');

    $('#browser-selection').change(function() {
        if ($('#browser-selection').val() != -1)
            $('#send-invitation').removeClass('ui-disabled');
        else
            $('#send-invitation').addClass('ui-disabled');

    });

    $('#withdraw-invitation').click(function() {
        if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) {
            delete messageEditor;
        }
        cancelInvitation(aVisitor.id);
        lzm_displayHelper.removeDialogWindow('chat-invitation');

    });
    $('#cancel-invitation').click(function() {

        if((!IFManager.IsAppFrame && !IFManager.IsMobileOS) || IFManager.IsDesktopApp()) {
            delete messageEditor;
        }
        lzm_displayHelper.removeDialogWindow('chat-invitation');
    });
    $('#send-invitation').click(function() {
        var thisGroup = DataEngine.groups.getGroup($('#group-selection').val());
        if (thisGroup == null || thisGroup.oh == '1')
        {
            if ((!IFManager.IsMobileOS && !IFManager.IsAppFrame) || IFManager.IsDesktopApp())
            {
                text = messageEditor.grabHtml();
                delete messageEditor;
            }
            else
            {
                text = $('#invitation-text').val()
            }

            if(ChatPollServerClass.__UserStatus == 3)
                setUserStatus(0, null);

            inviteExternalUser(aVisitor.id, $('#browser-selection').val(), text);
            lzm_displayHelper.removeDialogWindow('chat-invitation');
        }
        else
        {
            showOutsideOpeningMessage(thisGroup.name);
        }
    });

    UIRenderer.resizeVisitorInvitation();
    $('#browser-selection').focus();
};

ChatVisitorClass.prototype.createVisitorInvitation = function(visitor) {
    var pmLanguages = UserActions.getPmLanguages('');
    var myGroups = lzm_chatDisplay.myGroups, i = 0, browsers = [], labrowser={la:0,bid:''};

    for (i=0; i<visitor.b.length; i++)
    {
        if (visitor.b[i].id.indexOf('_OVL') == -1 && visitor.b[i].is_active)
        {
            var thisBrowser = lzm_commonTools.clone(visitor.b[i]);
            if(thisBrowser != null && d(thisBrowser.h2))
            {
                var historyLastEntry = thisBrowser.h2.length - 1;
                thisBrowser.url = thisBrowser.h2[historyLastEntry].url;

                if(thisBrowser.url.indexOf('chat.php?v=2') !== -1)
                    continue;

                var tmpDate = lzm_chatTimeStamp.getLocalTimeObject(thisBrowser.h2[historyLastEntry].time * 1000, true);
                thisBrowser.time = lzm_commonTools.getHumanDate(tmpDate, 'time', lzm_chatDisplay.userLanguage);
                browsers.push(thisBrowser);

                if(labrowser.la < thisBrowser.h2[historyLastEntry].time)
                    labrowser = {la:thisBrowser.h2[historyLastEntry].time,bid:visitor.b[i].id};
            }
        }
    }

    var visitorLangString = visitor.lang.toUpperCase().substr(0,2);
    var languageSelectHtml = '<label for="language-selection">' + t('Language:') + '</label><select id="language-selection" data-role="none">';
    visitorLangString = ($.inArray(visitorLangString, pmLanguages.group) != -1) ? visitorLangString : pmLanguages['default'][1];
    var defaultDefinedBy = pmLanguages['default'][0], langName;

    for (i=0; i<pmLanguages.group.length; i++)
    {
        langName = (typeof lzm_chatDisplay.availableLanguages[pmLanguages.group[i].toLowerCase().split('-')[0]] != 'undefined') ? pmLanguages.group[i] + ' - ' + lzm_chatDisplay.availableLanguages[pmLanguages.group[i].toLowerCase().split('-')[0]] : pmLanguages.group[i];
        if (defaultDefinedBy == 'group' && visitorLangString == pmLanguages.group[i])
            languageSelectHtml += '<option selected="selected" value="' + pmLanguages.group[i] + '---group">' + langName + ' (' + t('Group') + ')</option>';
        else
            languageSelectHtml += '<option value="' + pmLanguages.group[i] + '---group">' + langName + ' (' + t('Group') + ')</option>';
    }

    for (i=0; i<pmLanguages.user.length; i++)
    {
        langName = (typeof lzm_chatDisplay.availableLanguages[pmLanguages.user[i].toLowerCase()] != 'undefined') ?
            pmLanguages.user[i] + ' - ' + lzm_chatDisplay.availableLanguages[pmLanguages.user[i].toLowerCase()] :
            (typeof lzm_chatDisplay.availableLanguages[pmLanguages.user[i].toLowerCase().split('-')[0]] != 'undefined') ? pmLanguages.user[i] + ' - ' + lzm_chatDisplay.availableLanguages[pmLanguages.user[i].toLowerCase().split('-')[0]] :
                pmLanguages.user[i];
        if (defaultDefinedBy == 'user' && visitorLangString == pmLanguages.user[i])
            languageSelectHtml += '<option selected="selected" value="' + pmLanguages.user[i] + '---user">' + langName + ' (' + tid('operator') + ')</option>';
        else
            languageSelectHtml += '<option value="' + pmLanguages.user[i] + '---user">' + langName + ' (' + tid('operator') + ')</option>';

    }
    languageSelectHtml += '</select>';
    var groupSelectHtml = '<label for="group-selection">' + t('Group:') + '</label><select id="group-selection" data-role="none">';

    for (i=0; i<myGroups.length; i++) {
        var thisGroup = DataEngine.groups.getGroup(myGroups[i]);
        if (thisGroup != null && typeof thisGroup.oh != 'undefined')
            groupSelectHtml += '<option value="' + myGroups[i] + '">' + DataEngine.groups.getGroup(myGroups[i]).name + '</option>';
    }
    groupSelectHtml += '</select>';
    var browserSelectHtml = '<label for="browser-selection" class="top-space">' + tidc('browser') + '</label><select id="browser-selection" class="lzm-multiselect" size="3" data-role="none">';

    if (browsers.length != 0)
        for (i=browsers.length-1; i>=0; i--)
            browserSelectHtml += '<option value="' + browsers[i].id + '"'+(browsers[i].id==labrowser.bid ? ' selected' : '')+'>Browser ' + (i + 1) + ': ' + browsers[i].url + '</option>';
    else
    {
        browserSelectHtml += '<option value="-1">' + t('No active browser') + '</option>';
    }


    browserSelectHtml += '</select>';
    var textInputHtml = '<label for="invitation-text" class="top-space">' + tidc('invitation_text') + '</label>' +
        '<div id="invitation-text-inner">' +
        '<div id="invitation-text-controls">' +
        lzm_inputControls.createInputControlPanel('basic').replace(/lzm_chatInputEditor/g,'messageEditor') +
        '</div><div id="invitation-text-body"><textarea id="invitation-text" style="padding: 4px;"></textarea></div></div>';

    return '<fieldset id="user-invite-form" class="lzm-fieldset" data-role="none">' +
        '<legend>' + t('Chat Invitation') + '</legend><div id="user-invite-form-inner">' +
        '<table style="width: 100%;"><tr><td style="width:50%;">' + languageSelectHtml + '</td><td style="width:50%;">' + groupSelectHtml + '</td></tr>' +
        '<tr><td colspan="2">' + browserSelectHtml + '</td></tr><tr><td colspan="2">' + textInputHtml + '</td></tr></table></div></fieldset>';
};

ChatVisitorClass.prototype.showTranslateOptions = function(visitorChat, language) {
    var headerString = t('Auto Translation Setup'), that = this;
    var footerString =  lzm_inputControls.createButton('save-translate-options', '', '', t('Ok'), '', 'lr',{'margin-left': '4px'},'',30,'d') +
        lzm_inputControls.createButton('cancel-translate-options', '', '', t('Cancel'), '', 'lr',{'margin-left': '4px'},'',30,'d');
    var dialogData = {};
    var translateOptions = that.createTranslateOptions(visitorChat, language);
    var bodyString = translateOptions[0] + translateOptions[1];
    lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'translate-options', {}, {}, {}, {}, '', dialogData, false, false);
    UIRenderer.resizeTranslateOptions();
    if (lzm_chatDisplay.translationServiceError != null)
    {
        lzm_commonDialog.createAlertDialog(t('An error occured while fetching the languages from the Google Translate server.'), [{id: 'ok', name: t('Ok')}]);
        $('#alert-btn-ok').click(function() {
            lzm_commonDialog.removeAlertDialog();
            UserActions.getTranslationLanguages();
        });
    }
    $('#tmm-checkbox').change(function() {
        if ($('#tmm-checkbox').prop('checked')) {
            $('#tmm-select-div').removeClass('ui-disabled');
        } else {
            $('#tmm-select-div').addClass('ui-disabled');
        }
    });
    $('#tvm-checkbox').change(function() {
        if ($('#tvm-checkbox').prop('checked')) {
            $('#tvm-select-div').removeClass('ui-disabled');
        } else {
            $('#tvm-select-div').addClass('ui-disabled');
        }
    });
    $('#save-translate-options').click(function() {
        var tmm = {translate: $('#tmm-checkbox').prop('checked'), sourceLanguage: $('#tmm-source').val(), targetLanguage: $('#tmm-target').val()};
        var tvm = {translate: $('#tvm-checkbox').prop('checked'), sourceLanguage: 'AUTO', targetLanguage: $('#tvm-target').val()};
        UserActions.saveTranslationSettings(visitorChat, tmm, tvm);
        $('#cancel-translate-options').click();
    });
    $('#cancel-translate-options').click(function() {
        lzm_displayHelper.removeDialogWindow('translate-options');
    });
};

ChatVisitorClass.prototype.createTranslateOptions = function(visitorChat,language) {
    var translateOptions = ['', ''], selectedString = '', i;
    var sourceLanguage = (typeof lzm_chatDisplay.chatTranslations[visitorChat] != 'undefined' && lzm_chatDisplay.chatTranslations[visitorChat].tmm != null) ? lzm_chatDisplay.chatTranslations[visitorChat].tmm.sourceLanguage : UserActions.gTranslateLanguage;
    var targetLanguage = (typeof lzm_chatDisplay.chatTranslations[visitorChat] != 'undefined' && lzm_chatDisplay.chatTranslations[visitorChat].tmm != null) ? lzm_chatDisplay.chatTranslations[visitorChat].tmm.targetLanguage : language;

    var translate = (typeof lzm_chatDisplay.chatTranslations[visitorChat] != 'undefined' && lzm_chatDisplay.chatTranslations[visitorChat].tmm != null) ? lzm_chatDisplay.chatTranslations[visitorChat].tmm.translate : false;

    var checkedString = (translate) ? ' checked="checked"' : '';
    var disabledString = (!translate) ? ' ui-disabled' : '';
    translateOptions[0] = '<fieldset data-role="none" class="lzm-fieldset" id="translate-my-messages"><legend>' +
        t('My messages') + '</legend>' +
        '<input' + checkedString + ' type="checkbox" data-role="none" class="checkbox-custom" id="tmm-checkbox" style="vertical-align: middle;" />' +
        '<label for="tmm-checkbox" class="checkbox-custom-label">' + t('Translate my messages') + '</label><div id="tmm-select-div" class="top-space left-space-child' + disabledString + '"><label for="tmm-source">' + t('Translate from:') + '</label>' +
        '<select data-role="none" class="lzm-select translation-language-select" id="tmm-source">';
    for (i=0; i<lzm_chatDisplay.translationLanguages.length; i++) {
        selectedString = (lzm_chatDisplay.translationLanguages[i].language.toLowerCase() == sourceLanguage.toLowerCase()) ? ' selected="selected"' : '';
        translateOptions[0] += '<option' + selectedString + ' value="' + lzm_chatDisplay.translationLanguages[i].language + '">' +
            lzm_chatDisplay.translationLanguages[i].name + ' - ' + lzm_chatDisplay.translationLanguages[i].language.toUpperCase() + '</option>';
    }
    translateOptions[0] +='</select><br /><br />' +
        '<label for="tmm-target">' + t('Translate into:') + '</label>' +
        '<select data-role="none" class="lzm-select translation-language-select" id="tmm-target">';
    for (i=0; i<lzm_chatDisplay.translationLanguages.length; i++) {
        selectedString = (lzm_chatDisplay.translationLanguages[i].language.toLowerCase() == targetLanguage.toLowerCase()) ? ' selected="selected"' : '';
        translateOptions[0] += '<option' + selectedString + ' value="' + lzm_chatDisplay.translationLanguages[i].language + '">' +
            lzm_chatDisplay.translationLanguages[i].name + ' - ' + lzm_chatDisplay.translationLanguages[i].language.toUpperCase() + '</option>';
    }
    translateOptions[0] +='</select></div></fieldset>';

    targetLanguage = (typeof lzm_chatDisplay.chatTranslations[visitorChat] != 'undefined' && lzm_chatDisplay.chatTranslations[visitorChat].tvm != null) ? lzm_chatDisplay.chatTranslations[visitorChat].tvm.targetLanguage : UserActions.gTranslateLanguage;

    translate = (typeof lzm_chatDisplay.chatTranslations[visitorChat] != 'undefined' && lzm_chatDisplay.chatTranslations[visitorChat].tvm != null) ? lzm_chatDisplay.chatTranslations[visitorChat].tvm.translate : false;
    checkedString = (translate) ? ' checked="checked"' : '';
    disabledString = (!translate) ? ' ui-disabled' : '';
    translateOptions[1] = '<fieldset data-role="none" class="lzm-fieldset" id="translate-visitor-messages"><legend>' + t('Visitor\'s messages') + '</legend>' +
        '<input' + checkedString + ' type="checkbox" data-role="none" class="checkbox-custom" id="tvm-checkbox" style="vertical-align: middle;" />' +
        '<label for="tvm-checkbox" class="checkbox-custom-label">' + t('Translate visitor\'s messages') + '</label>' +
        '<div id="tvm-select-div" class="top-space left-space-child' + disabledString + '">' +
        '<label for="tvm-target">' + t('Translate into:') + '</label>' +
        '<select data-role="none" class="lzm-select translation-language-select" id="tvm-target">';

    if(d(lzm_chatDisplay.translationLanguages))
        for (i=0; i<lzm_chatDisplay.translationLanguages.length; i++)
        {
            selectedString = (lzm_chatDisplay.translationLanguages[i].language.toLowerCase() == targetLanguage.toLowerCase()) ? ' selected="selected"' : '';
            translateOptions[1] += '<option' + selectedString + ' value="' + lzm_chatDisplay.translationLanguages[i].language + '">' +
                lzm_chatDisplay.translationLanguages[i].name + ' - ' + lzm_chatDisplay.translationLanguages[i].language.toUpperCase() + '</option>';
        }

    translateOptions[1] +='</select></div></fieldset>';
    return translateOptions;
};

ChatVisitorClass.prototype.createVisitorStrings = function(type, aUser) {
    var returnListString = '';
    /*

    if (type.indexOf('.') != -1)
    {
        type = type.split('.');
    }
    else
    {
        type = [type];
    }
    if (aUser.b.length > 0)
    {
        for (var i=0; i<aUser.b.length; i++) {
            if (type.length == 1) {
                if (typeof aUser.b[i][type[0]] != 'undefined' && aUser.b[i][type[0]] != '' &&
                    $.inArray(aUser.b[i][type[0]], visitorStringList) == -1) {
                    visitorStringList.push(lzm_commonTools.htmlEntities(aUser.b[i][type[0]]));
                }
            } else {
                if (typeof aUser.b[i][type[0]][type[1]] != 'undefined' && aUser.b[i][type[0]][type[1]] != '' &&
                    $.inArray(aUser.b[i][type[0]][type[1]], visitorStringList) == -1) {
                    visitorStringList.push(lzm_commonTools.htmlEntities(aUser.b[i][type[0]][type[1]]));
                }
            }
        }
    }
    if (typeof visitorStringList != undefined && visitorStringList instanceof Array && visitorStringList.length > 0) {
        returnListString = visitorStringList.join(', ');
    }
    */
    return returnListString;
};

ChatVisitorClass.prototype.createVisitorPageString = function(aUser) {
    var activeBrowserCounter = 0, activeBrowserUrl = '', that = this;
    try {
        for (var i=0; i< aUser.b.length; i++) {
            if (aUser.b[i].id.indexOf('OVL') == -1 && aUser.b[i].is_active) {
                activeBrowserCounter++;
                var historyLength = aUser.b[i].h2.length;
                var url = aUser.b[i].h2[historyLength - 1].url;
                var text = (url.length > 128) ? url.substring(0,124) : url;
                activeBrowserUrl = '<a href="#" class="lz_chat_link_no_icon" data-role="none" onclick="openLink(\'' + url + '\');">' + text + '</a>';
            }
        }
    } catch(ex) {}
    if (activeBrowserCounter > 1) {
        activeBrowserUrl = t('<!--number_of_browsers--> Browsers', [['<!--number_of_browsers-->', activeBrowserCounter]]);
    }
    return activeBrowserUrl;
};

ChatVisitorClass.prototype.createVisitorAreaString = function(aUser) {
    var areaStringArray = [], areaCodeArray = [];
    for (var i=0; i<aUser.b.length; i++)
    {
        if(d(aUser.b[i].h2))
            for (var j=0; j<aUser.b[i].h2.length; j++) {
                if (aUser.b[i].h2[j].code != '' && $.inArray(aUser.b[i].h2[j].code, areaCodeArray) == -1) {
                    var chatPageString = (aUser.b[i].h2[j].cp == 1) ? ' (' + t('CHAT') + ')' : '';
                    areaCodeArray.push(aUser.b[i].h2[j].code);
                    areaStringArray.push(aUser.b[i].h2[j].code + chatPageString);
                }
            }
    }

    return areaStringArray.join(', ');
};

ChatVisitorClass.prototype.calculateTimeDifference = function(aUser, type, includeSeconds) {

    if(!d(aUser.b))
        return [0,0];

    var tmpBegin, tmpTimeDifference, tmpDiffSeconds, tmpDiffMinutes, tmpDiffHours, tmpDiffDays, tmpRest, returnString = '';
    var i, foo;
    if (type=='lastOnline')
    {
        tmpBegin = lzm_chatTimeStamp.getServerTimeString(null, true, 1);
        for (i=0; i<aUser.b.length; i++)
        {
            if (d(aUser.b[i].h2) && aUser.b[i].id.indexOf('_OVL')==-1 && aUser.b[i].h2.length > 0)
            {
                tmpBegin = Math.min(aUser.b[i].h2[0].time * 1000, tmpBegin);
                foo = lzm_chatTimeStamp.getLocalTimeObject(tmpBegin, true);
            }
        }
    }
    else if (type=='lastActive')
    {
        tmpBegin = 0;
        for (i=0; i<aUser.b.length; i++)
        {
            if (d(aUser.b[i].h2) && aUser.b[i].h2.length > 0)
            {
                var newestH = aUser.b[i].h2.length - 1;
                tmpBegin = Math.max(aUser.b[i].h2[newestH].time * 1000, tmpBegin);
                foo = lzm_chatTimeStamp.getLocalTimeObject(tmpBegin, true);
            }
        }
    }
    if (tmpBegin == 0)
        tmpBegin = lzm_chatTimeStamp.getServerTimeString(null, false, 1);

    tmpTimeDifference = Math.floor(lzm_chatTimeStamp.getServerTimeString(null, false, 1) - tmpBegin) / 1000;
    tmpDiffSeconds = Math.max(0, tmpTimeDifference % 60);
    tmpRest = Math.floor(tmpTimeDifference / 60);
    tmpDiffMinutes = Math.max(0, tmpRest % 60);
    tmpRest = Math.floor(tmpRest / 60);
    tmpDiffHours = Math.max(0, tmpRest % 24);
    tmpDiffDays = Math.max(0, Math.floor(tmpRest / 24));

    if (tmpDiffDays > 0)
        returnString += tmpDiffDays + ' ';

    returnString += '<!-- ' + tmpBegin + ' -->' + lzm_commonTools.pad(tmpDiffHours, 2) + ':' + lzm_commonTools.pad(tmpDiffMinutes, 2);
    if (typeof includeSeconds != 'undefined' && includeSeconds) {
        returnString += ':' + lzm_commonTools.pad(Math.round(tmpDiffSeconds), 2);
    }
    return [returnString, tmpBegin];
};

ChatVisitorClass.prototype.createCustomInputString = function(visitor, inputId) {
    return DataEngine.inputList.getInputValueFromVisitor(inputId,visitor);
};

ChatVisitorClass.prototype.getVisitorOnlineTimes = function(visitor) {
    var rtObject = {}, that = this;
    rtObject['online'] = that.calculateTimeDifference(visitor, 'lastOnline', false)[0].replace(/-/g,'&#8209;').replace(/ /g,'&nbsp;');
    rtObject['active'] = that.calculateTimeDifference(visitor, 'lastActive', false)[0].replace(/-/g,'&#8209;').replace(/ /g,'&nbsp;');
    return rtObject;
};

ChatVisitorClass.prototype.getVisitorOnlineTimestamp = function(aUser) {
    var selectedUserOnlineBeginn = 4294967295, that = this;
    for (var i=0; i<aUser.b.length; i++) {
        if (typeof aUser.b[i].h2 != 'undefined') {
            for (var j=0; j<aUser.b[i].h2.length; j++) {
                selectedUserOnlineBeginn = (aUser.b[i].h2[j].time < selectedUserOnlineBeginn) ? aUser.b[i].h2[j].time : selectedUserOnlineBeginn;
            }
        }
    }
    return selectedUserOnlineBeginn;
};

ChatVisitorClass.prototype.calculateTimeSpan = function(beginTime, endTime) {

    var secondsSpent = endTime.getSeconds() - beginTime.getSeconds();
    var minutesSpent = endTime.getMinutes() - beginTime.getMinutes();
    var hoursSpent = endTime.getHours() - beginTime.getHours();
    var daysSpent = endTime.getDate() - beginTime.getDate();
    if (daysSpent < 0) {
        var currentMonth = endTime.getMonth();
        var monthLength = 31;
        if ($.inArray(currentMonth, [3,5,8,10]) != -1) {
            monthLength = 30;
        }
        if (currentMonth == 1) {
            monthLength = 28;
        }
        daysSpent = (monthLength - beginTime.getDate()) + endTime.getDate();
    }
    if (secondsSpent < 0) {
        secondsSpent += 60;
        minutesSpent -= 1;
    }
    if (minutesSpent < 0) {
        minutesSpent += 60;
        hoursSpent -= 1;
    }
    if (hoursSpent < 0) {
        hoursSpent += 24;
        daysSpent -= 1;
    }
    var timeSpan = lzm_commonTools.pad(hoursSpent, 2) + ':' + lzm_commonTools.pad(minutesSpent, 2) + ':' +
        lzm_commonTools.pad(secondsSpent, 2);
    if (daysSpent > 0) {
        timeSpan = daysSpent + '.' + timeSpan;
    }
    return timeSpan;
};

ChatVisitorClass.prototype.createVisitorListContextMenu = function(myObject) {

    var externalIsDisabled = (lzm_chatDisplay.myGroups.length > 0),i;
    for (i=0; i<lzm_chatDisplay.myGroups.length; i++) {
        var myGr = DataEngine.groups.getGroup(lzm_chatDisplay.myGroups[i]);
        if (myGr != null && myGr.external == '1')
            externalIsDisabled = false;
    }

    var contextMenuHtml = '';
    contextMenuHtml += '<div onclick="showVisitorInfo(\'' + myObject.visitor.id + '\');removeVisitorListContextMenu();"><span id="show-this-visitor-details" class="cm-line cm-click">' + t('Details') + '</span></div><hr />';
    var disabledClass = (externalIsDisabled || (myObject.chatting == 'true' && myObject.declined == 'false')) ? ' class="ui-disabled"' : '';
    var invText = (myObject.status != 'requested') ? t('Chat Invitation') : t('Cancel invitation(s)');
    var onclickAction = (myObject.status != 'requested') ? 'showVisitorInvitation(\'' + myObject.visitor.id + '\');removeVisitorListContextMenu();' : 'cancelInvitation(\'' + myObject.visitor.id + '\');removeVisitorListContextMenu();';
    contextMenuHtml += '<div' + disabledClass + ' onclick="' + onclickAction + '"><span id="invite-this-visitor" class="cm-line cm-click">' + invText + '</span></div>';

    disabledClass = (myObject.visitor.IsInChat) ? ' class="ui-disabled"' : '';
    onclickAction = 'startVisitorChat(\'' + myObject.visitor.id + '\');removeVisitorListContextMenu();';
    contextMenuHtml += '<div' + disabledClass + ' onclick="' + onclickAction + '">' + '<span id="start-chat-this-visitor" class="cm-line cm-click">' + t('Start Chat') + '</span></div><hr />';

    disabledClass = (externalIsDisabled) ? ' class="ui-disabled"' : '';
    contextMenuHtml += '<div' + disabledClass + ' onclick="showFilterCreation(\'visitor\',\'' + myObject.visitor.id + '\'); removeVisitorListContextMenu();"><span class="cm-line cm-click">' + t('Ban (add filter)') + '</span></div>';
    return contextMenuHtml;
};

ChatVisitorClass.__UpdateMap = function(_switch){

    function ___changeStatus(_status)
    {
        LocalConfiguration.ShowVisitorsMap = _status;
        LocalConfiguration.Save();
        lzm_chatDisplay.VisitorsUI.UpdateVisitorList();
    }

    if(d(_switch) && _switch)
    {
        ___changeStatus(!LocalConfiguration.ShowVisitorsMap);
    }

    if(parseInt(DataEngine.crc3[2])<0)
    {
        $('#visitors-map').addClass('ui-disabled');
        if(LocalConfiguration.ShowVisitorsMap)
            ___changeStatus(false);
    }
    else if(LocalConfiguration.ShowVisitorsMap)
        $('#visitors-map').addClass('lzm-button-b-pushed');
    else
        $('#visitors-map').removeClass('lzm-button-b-pushed');

    if (LocalConfiguration.ShowVisitorsMap && $('#geotracking-body').data('src') == '')
    {
        var gtKey = DataEngine.getConfigValue('gl_pr_ngl',true);
        gtKey = (gtKey != null && d(gtKey.value)) ? lz_global_base64_decode(gtKey.value) : '';

        var myServerAddress = 'https://ssl.livezilla.net';
        var geoTrackingUrl = 'https://ssl.livezilla.net/geo/map/index.php?web=1&mv=3&pvc=' + lzm_commonConfig.lz_version + '&key=' + gtKey;

        if(gtKey.length && parseInt(DataEngine.crc3[2])>0)
        {
            $('#geotracking-body').data('src', geoTrackingUrl);
            $('#geotracking-iframe').attr('src', geoTrackingUrl);
            lzm_chatGeoTrackingMap.setIframe($('#geotracking-iframe')[0]);
            lzm_chatGeoTrackingMap.setReceiver(myServerAddress);
        }
        else
        {
            ChatVisitorClass.__UpdateMap(true);
            return;
        }
    }
    if (!lzm_chatGeoTrackingMap.delayAddIsInProgress)
        lzm_chatGeoTrackingMap.addOrQueueVisitor();

    if (lzm_chatGeoTrackingMap.selectedVisitor != null)
        lzm_chatGeoTrackingMap.setSelection(lzm_chatGeoTrackingMap.selectedVisitor, '');

    UIRenderer.ResizeVisitorList();
};

ChatVisitorClass.__SetVisitorFilter = function(){

    var filterHTML = '<div><fieldset class="lzm-fieldset"><legend>'+tid('filter')+'</legend>';

    if(LocalConfiguration.VisitorFilterHideInactive === false)
        LocalConfiguration.VisitorFilterHideInactive = 0;

    filterHTML += lzm_inputControls.createCheckbox('svf-hide-inactive', tidc('hide_inactive'),LocalConfiguration.VisitorFilterHideInactive != 0);
    filterHTML += '<div class="left-space-child top-space-half">' + lzm_inputControls.createInput('svf-inactive-time','',LocalConfiguration.VisitorFilterHideInactive,'','','number','','',tid('minutes')) + '</div>';
    filterHTML += '</fieldset></div>';

    var headerString = tid('filters');
    var footerString = lzm_inputControls.createButton('svf-ok-btn', '', '', tid('ok'), '', 'force-text',{'margin-left': '4px','padding': '3px 10px'},'',30,'d');
    var dialogData = {};
    var bodyString = filterHTML;

    lzm_displayHelper.createDialogWindow(headerString, bodyString, footerString, 'set_visitor_filter', {}, {}, {}, {}, '', dialogData, false, false, 'set_visitor_filter_dialog');

    $('#svf-hide-inactive').change(function(){
        if($('#svf-hide-inactive').prop('checked'))
            $('#svf-inactive-time').removeClass('ui-disabled');
        else
            $('#svf-inactive-time').addClass('ui-disabled');
    });
    $('#svf-hide-inactive').change();
    $('#svf-ok-btn').click(function() {

        if($('#svf-hide-inactive').prop('checked'))
            LocalConfiguration.VisitorFilterHideInactive = $('#svf-inactive-time').val();
        else
            LocalConfiguration.VisitorFilterHideInactive = 0;

        LocalConfiguration.Save();
        VisitorManager.UpdateUI = true;
        lzm_chatDisplay.VisitorsUI.UpdateVisitorList();
        lzm_displayHelper.removeDialogWindow('set_visitor_filter');

    });
};

ChatVisitorClass.__LoadCoBrowsingContent = function (elementId, _browser, noActiveBrowserPresent) {

    _browser = (typeof _browser != 'undefined') ? _browser : VisitorManager.GetVisitorBrowser($('#visitor-cobrowse-'+elementId+'-iframe').data('browser'));
    noActiveBrowserPresent = (typeof noActiveBrowserPresent != 'undefined') ? noActiveBrowserPresent : false;

    var iframeHeight = $('#visitor-cobrowse-'+elementId+'-iframe').height();
    var iframeWidth = $('#visitor-cobrowse-'+elementId+'-iframe').width();

    if (!noActiveBrowserPresent && _browser != null)
    {
        var browserUrl = _browser.h2[_browser.h2.length - 1].url;
        var urlParts = browserUrl.split('#');
        var paramDivisor = (urlParts[0].indexOf('?') == -1) ? '?' : '&';
        var acid = md5(Math.random().toString()).substr(0, 5);
        urlParts[0] += paramDivisor + 'lzcobrowse=true&lzmobile=true&acid=' + acid;
        var coBrowseUrl = urlParts.join('#');

        if(window.location.href.toLowerCase().indexOf('https://') === 0 && coBrowseUrl.toLowerCase().indexOf('http://') === 0)
            coBrowseUrl = coBrowseUrl.replace(new RegExp('http://', "ig"),'https://');

        $('#visitor-cobrowse-'+elementId+'-iframe').data('browser-url', browserUrl);
        var oldIframeDataBrowser = $('#visitor-cobrowse-'+elementId+'-iframe').data('browser');
        var oldIframeDataBrowserUrl = $('#visitor-cobrowse-'+elementId+'-iframe').data('browser-url');
        var oldIframeDataLanguage = $('#visitor-cobrowse-'+elementId+'-iframe').data('language');
        var oldIframeDataAction = $('#visitor-cobrowse-'+elementId+'-iframe').data('action');
        var oldIframeDataVisible = $('#visitor-cobrowse-'+elementId+'-iframe').data('visible');
        var newIframeHtml = '<iframe id="visitor-cobrowse-'+elementId+'-iframe"' +
            ' data-browser="' + oldIframeDataBrowser + '"' +
            ' data-browser-url="' + oldIframeDataBrowserUrl + '"' +
            ' data-action="' + oldIframeDataAction + '"' +
            ' data-language="' + oldIframeDataLanguage + '"' +
            ' data-visible="' + oldIframeDataVisible + '"' +
            ' src="' + coBrowseUrl + '" class="visitor-cobrowse-iframe"></iframe>';
        $('#visitor-cobrowse-'+elementId+'-iframe').replaceWith(newIframeHtml).trigger('create');
        UIRenderer.resizeVisitorDetails();
    }
    else if (noActiveBrowserPresent)
    {
        //enableCobrowsingIframe(elementId);
        $('#visitor-cobrowse-'+elementId+'-iframe').data('browser-url', '');
        $('#visitor-cobrowse-'+elementId+'-iframe').attr('src', '');
        var fontSize = (iframeWidth < 400) ? 18 : 22;
        var marginTop = Math.floor((iframeHeight - fontSize - 2) / 2);
        setTimeout(function() {
            $('#visitor-cobrowse-'+elementId+'-iframe').contents().find('body').html('<div style="text-align: center; background: #fff; font-weight: bold;' +
                ' font-size: ' + fontSize + 'px; color: #bbb; font-family: Arial,Helvetica,Liberation Sans,DejaVu Sans,sans-serif;">' +
                '<span>' + t('The visitor has left the website') + '</span></div>');
            $('#visitor-cobrowse-'+elementId+'-iframe').contents().find('body').css({'margin-top': marginTop+'px'});
        }, 20);
    }
};

