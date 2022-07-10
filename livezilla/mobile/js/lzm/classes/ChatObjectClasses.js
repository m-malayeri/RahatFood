/****************************************************************************************
 * LiveZilla ChatObjectClasses.js
 *
 * Copyright 2014 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 ***************************************************************************************/

function Client(){}
Client.Logs = [];

function ChatTimestampClass(timeDifference) {
    this.timeDifference = timeDifference * 1000;
}

ChatTimestampClass.prototype.setTimeDifference = function(timeDifference) {
    this.timeDifference = timeDifference * 1000;
};

ChatTimestampClass.prototype.getLocalTimeObject = function(timeStamp, doCalcTimeDiff) {
    timeStamp = (typeof timeStamp != 'undefined' && timeStamp != null) ? timeStamp : $.now();
    doCalcTimeDiff = (typeof doCalcTimeDiff != 'undefined') ? doCalcTimeDiff : false;
    var calculatedTimeStamp = (doCalcTimeDiff) ? parseInt(timeStamp) - parseInt(this.timeDifference) : parseInt(timeStamp);
    var tmpDateObject = new Date(calculatedTimeStamp);
    return tmpDateObject;
};

ChatTimestampClass.prototype.getServerTimeString = function(dateObject, doCalcTimeDiff, divideBy) {
    dateObject = (typeof dateObject != 'undefined' && dateObject != null) ? dateObject : new Date();
    doCalcTimeDiff = (typeof doCalcTimeDiff != 'undefined') ? doCalcTimeDiff : false;
    divideBy = (typeof divideBy != 'undefined') ? divideBy : 1000;
    var calculatedTimeString = (doCalcTimeDiff) ? dateObject.getTime() + parseInt(this.timeDifference) : dateObject.getTime();
    return Math.floor(calculatedTimeString / divideBy);
};

function LzmFilters() {
    this.idList = [];
    this.oldFilterIds = [];
    this.objects = {};
    this.initialRun = true;
}

LzmFilters.prototype.setFilter = function(filter) {
    if ($.inArray(filter.filterid, this.idList) == -1) {
        this.idList.push(filter.filterid);
    }
    this.objects[filter.filterid] = filter;

    if (typeof this.objects[filter.filterid] != 'undefined') {
        return this.objects[filter.filterid];
    } else {
        return null;
    }
};

LzmFilters.prototype.getFilter = function(filterId) {
    if ($.inArray(filterId, this.idList) != -1) {
        return lzm_commonTools.clone(this.objects[filterId]);
    } else {
        return null;
    }
};

LzmFilters.prototype.getFilterList = function() {
    var filterList = [];
    for (var i=0; i<this.idList.length; i++) {
        var thisFilter = this.getFilter(this.idList[i]);
        if (thisFilter != null) {
            filterList.push(thisFilter);
        }
    }
    return filterList;
};

LzmFilters.prototype.removeFilter = function(filterId) {
    var tmpArray = [];
    for (var i=0; i<this.idList; i++) {
        if (this.idList[i] != filterId) {
            tmpArray.push(this.idList[i]);
        }
    }
    this.idList = tmpArray;
    delete this.objects[filterId];
};

LzmFilters.prototype.getNewFilters = function() {
    var newFilterArray = [];
    for (var i=0; i<this.idList.length; i++) {
        if ($.inArray(this.idList[i], this.oldFilterIds) == -1) {
            var newFilter = this.getFilter(this.idList[i]);
            if (newFilter != null && newFilter.creator != DataEngine.myId && !this.initialRun) {
                newFilterArray.push(newFilter);
            }
        }
    }
    this.oldFilterIds = lzm_commonTools.clone(this.idList);
    this.initialRun = false;
    return newFilterArray;
};

LzmFilters.prototype.clearFilters = function() {
    this.idList = [];
    this.objects = {};
};

function LzmCustomInputs() {
    this.idList = [];
    this.objects = {};
    this.nameList = {};
}

LzmCustomInputs.prototype.setCustomInput = function(customInput) {
    var displayVisitor = true, displayTicket = true, displayArchive = true, displayAllChats = true;
    if ($.inArray(customInput.id, this.idList) == -1) {
        this.idList.push(customInput.id);
    }
    else
    {
        displayVisitor = this.objects[customInput.id].display.visitor;
        displayTicket = this.objects[customInput.id].display.ticket;
        displayArchive = this.objects[customInput.id].display.archive;
        displayAllChats = this.objects[customInput.id].display.allchats;
    }
    if (typeof customInput.value == 'string')
        customInput.value = this.parseInputValue(customInput.value);

    customInput.value.display = {visitor: displayVisitor, ticket: displayTicket, archive: displayArchive, allchats: displayAllChats};
    this.objects[customInput.id] = customInput.value;
    if (customInput.value.name != '')
        this.nameList[customInput.value.name] = customInput.id;

    if (typeof this.objects[customInput.id] != 'undefined')
        return this.objects[customInput.id];
    else
        return null;
};

LzmCustomInputs.prototype.copyCustomInput = function(customInput) {
    if ($.inArray(customInput.id, this.idList) == -1) {
        this.idList.push(customInput.id);
        this.objects[customInput.id] = customInput;
        this.nameList[customInput.value.name] = customInput.id;
    }
};

LzmCustomInputs.prototype.getCustomInput = function(id, searchBy, clone) {

    id = id.replace('f','');
    searchBy = (typeof searchBy != 'undefined') ? searchBy : 'id';
    clone = (d(clone)) ? clone : true;
    if (searchBy == 'id' && $.inArray(id, this.idList) != -1)
        return (clone) ? lzm_commonTools.clone(this.objects[id]) : this.objects[id];
    else if (searchBy == 'name' && typeof this.nameList[id] != 'undefined')
        return this.getCustomInput(this.nameList[id]);
    else
        return null;
};

LzmCustomInputs.prototype.getInputValueFromVisitor = function (inputId,visitor,maxLength,raw){

    raw = (d(raw)) ? raw : false;
    var obj, pairs = [],returnVal = '-';

    if(visitor!=null)
    {
        for(var cid in visitor.d){
            obj ={};
            obj[cid] = visitor.d[cid];
            pairs.push(obj);
        }
    }
    else
        return '';

    for(var key in pairs)
        if(d(pairs[key][inputId.toString()]))
            returnVal = pairs[key][inputId.toString()];
        else if(d(pairs[key]["f"+inputId.toString()]))
            returnVal = pairs[key]["f" + inputId.toString()]

    if(d(maxLength) && maxLength != null && returnVal.length>maxLength)
        returnVal = returnVal.substring(0, maxLength);

    if(inputId < 100)
    {
        var myCustomInput = DataEngine.inputList.getCustomInput(inputId.toString());
        if (myCustomInput.type == 'ComboBox' && d(myCustomInput.value[returnVal]) && !raw)
            returnVal = myCustomInput.value[returnVal];
        else if (myCustomInput.type == 'CheckBox' && !raw)
            returnVal = (returnVal == 1) ? t('Yes') : t('No');
    }

    if(raw)
        return returnVal;
    else
        return lzm_commonTools.htmlEntities(returnVal);
};

LzmCustomInputs.prototype.getControlHTML = function(input,id,className,value){
    if(input.type == 'CheckBox')
        return lzm_inputControls.createCheckbox(id,input.name,value.toString()=='1',className,'');
    else if(input.type == 'ComboBox')
    {
        var opts = [];
        for(var key in input.value)
            opts.push({text:input.value[key],value:input.value[key]});
        return lzm_inputControls.createSelect(id,className,'',input.name+':','','',input.name,opts,input.value[value],'');
    }
    return lzm_inputControls.createInput(id,className,value,input.name+':', '', 'text', '');
};

LzmCustomInputs.prototype.getControlValue = function(input,id){

    var ctrl = $('#'+id);
    if(!ctrl.length)
        return '';
    if(input.type == 'CheckBox')
        return ctrl.prop('checked') ? '1' : '0';
    if(input.type == 'ComboBox')
        return ctrl.prop('selectedIndex').toString();
    else
        return ctrl.val();
};

LzmCustomInputs.prototype.getCustomInputList = function(type, onlyActive) {
    type = (typeof type != 'undefined') ? type : 'custom';
    onlyActive = (typeof onlyActive != 'undefined') ? onlyActive : false;
    var limit = (type == 'full') ? 2000000000 : 111;
    var customInputArray = [];
    for (var i=0; i<this.idList.length; i++) {
        if (parseInt(this.idList[i]) < limit) {
            if (!onlyActive || this.objects[this.idList[i]].active == 1) {
                customInputArray.push(lzm_commonTools.clone(this.objects[this.idList[i]]));
            }
        }
    }
    return customInputArray;
};

LzmCustomInputs.prototype.clearCustomInputs = function() {
    this.idList = [];
    this.objects = {};
    this.nameList = {};
};

LzmCustomInputs.prototype.parseInputValue = function(value) {
    value = lz_global_base64_url_decode(value);
    value = lzm_commonTools.phpUnserialize(value);

    var customValue = value[7];
    if (value[3] == 'ComboBox')
        customValue = (value[7].indexOf(';') != -1) ? value[7].split(';') : [value[7]];
    var infoText = (value.length > 12) ? value[12] : '';
    var valueObject = {id: value[0], title: value[1], name: value[2],type: value[3], active: value[4], cookie: value[5], position: value[6], value: customValue, info: infoText, val_a: value[8], val_url: value[9], val_ti: value[10], val_poe: value[11]};
    return valueObject;
};

LzmCustomInputs.prototype.getInputHtmlRow = function(inp) {
    var typeList = [{value:'Text',text:'Text'},{value:'TextArea',text:'TextArea'},{value:'CheckBox',text:'CheckBox'},{value:'ComboBox',text:'ComboBox'},{value:'File',text:'File'}];
    var posList = [];
    for(var i=1;i<16;i++)
        posList.push({value:i,text:i});
    var icon_col = (inp.val_a!='1') ? 'icon-light' : 'icon-orange';
    var value = ($.isArray(inp.value)) ? inp.value.join(';') : inp.value;
    return '<tr id="inp_row_'+inp.id+'">' +
        '<td style="text-align:center;">'+inp.id+'</td>' +
        '<td style="text-align:center;">'+lzm_inputControls.createCheckbox('ia_' + inp.id,'',inp.active=='1')+'</td>' +
        '<td style="text-align:center;">'+lzm_inputControls.createCheckbox('ic_' + inp.id,'',inp.cookie=='1')+'</td>' +
        '<td>'+lzm_inputControls.createInput('in_' + inp.id, '', inp.name, '', '', 'text', '')+'</td>' +
        '<td>'+lzm_inputControls.createSelect('ict_' + inp.id, '', '', '', {}, {}, '', typeList, inp.type, '')+'</td>' +
        '<td style="text-align:center;">'+((parseInt(inp.id)>=100) ? 'Standard' : 'Custom')+'</td>' +
        '<td>'+lzm_inputControls.createInput('icap_' + inp.id, '', inp.title, '', '', 'text', '')+'</td>' +
        '<td>'+lzm_inputControls.createInput('ii_' + inp.id, '', inp.info, '', '', 'text', '')+'</td>' +
        '<td>'+lzm_inputControls.createSelect('ip_' + inp.id, '', '', '', {}, {}, '', posList, inp.position, '')+'</td>' +
        '<td>'+lzm_inputControls.createInput('iv_' + inp.id, '', value, '', '', 'text', '')+'</td>' +
        '<td id="ivalf_' + inp.id +'" style="text-align:center;">'+lzm_inputControls.createButton('ival_' + inp.id, '','setValidation(\''+inp.id+'\');', tid('validation'), '<i class="fa fa-cog '+icon_col+'" id="ivali_'+inp.id+'" style="font-size:12px;"></i>', '', {'padding': '5px 15px'}, '', '')+'</td>' +
        '</tr>';
};

LzmCustomInputs.prototype.applyInputHtmlRow = function(inp) {
    inp.active = $('#ia_' + inp.id).prop('checked') ? '1' : '0';
    inp.cookie = $('#ic_' + inp.id).prop('checked') ? '1' : '0';
    inp.name = $('#in_' + inp.id).val();

    if(inp.name.length > 32)
        inp.name = inp.name.substr(0,32);

    inp.type = $('#ict_' + inp.id).val();
    inp.title = $('#icap_' + inp.id).val();
    inp.info = $('#ii_' + inp.id).val();
    inp.position = $('#ip_' + inp.id).val();
    inp.value = $('#iv_' + inp.id).val();
    if(typeof $("#ival_" + inp.id).attr('data-val') != 'undefined')
    {
        var vinput = JSON.parse($("#ival_" + inp.id).attr('data-val'));
        inp.val_a = vinput.val_a;
        inp.val_url = vinput.val_url;
        inp.val_ti = vinput.val_ti;
        inp.val_poe = vinput.val_poe;
    }
};

LzmCustomInputs.prototype.phpSerializeInput = function(input) {
    var values = [];
    values.push(input.id);
    values.push(input.title);
    values.push(input.name);
    values.push(input.type);
    values.push(input.active);
    values.push(input.cookie);
    values.push(input.position);
    values.push(input.value);
    values.push(input.val_a);
    values.push(input.val_url);
    values.push(input.val_ti);
    values.push(input.val_poe);
    values.push(input.info);
    return lz_global_base64_encode(lzm_commonTools.phpSerialize(values, true));
};

LzmCustomInputs.prototype.setDisplay = function(id, type, isVisible) {
    if (typeof this.objects[id] != null) {
        this.objects[id].display[type] = isVisible;
    }
};

function LzmOperators() {
    this.idList = [];
    this.objects = {};
    this.uidList = {};
}

LzmOperators.prototype.setOperator = function(operator,oldList) {

    var oldst = null;

    if ($.inArray(operator.id, this.idList) == -1)
        this.idList.push(operator.id);

    if (d(oldList) && d(oldList[operator.id]))
        oldst = oldList[operator.id].status;

    if(typeof LocalConfiguration != 'undefined' && LocalConfiguration.NotificationOperators && oldst == '2' && operator.status != '2' && operator.id != DataEngine.myId && DataEngine.myId != '')
    {
        var ntext = tid('operator_signed_on',[['<!--op_login_name-->',operator.name]]);
        if(IFManager.IsDesktopApp())
            IFManager.IFShowNotification(operator.name, ntext, 'NONE', '', '', '5');
        else if(!IFManager.IsAppFrame)
            lzm_displayHelper.showBrowserNotification({text: ntext, sender: '',subject: operator.name,action: 'OpenChatTab(\''+operator.id+'\');',timeout: 10,icon: 'fa-user'});
    }

    this.objects[operator.id] = operator;
    this.uidList[operator.userid] = operator.id;

    if (typeof this.objects[operator.id] != 'undefined')
    {
        return this.objects[operator.id];
    }
    else
    {
        return null;
    }
};

LzmOperators.prototype.copyOperator = function(operator) {
    if ($.inArray(operator.id, this.idList) == -1) {
        this.idList.push(operator.id);
    }
    try {
        this.objects[operator.id] = lzm_commonTools.clone(operator);
        this.uidList[operator.userid] = operator.id;
    } catch(ex) {deblog(ex);}
};

LzmOperators.prototype.setOperatorProperty = function(operatorId, myKey, myValue) {
    if (typeof this.objects[operatorId] != 'undefined')
    {
        this.objects[operatorId][myKey] = lzm_commonTools.clone(myValue);
        return lzm_commonTools.clone(this.objects[operatorId]);
    }
    return null;
};

LzmOperators.prototype.getOperator = function(operatorId, searchBy) {
    searchBy = (typeof searchBy != 'undefined') ? searchBy : 'id';
    if (searchBy == 'id' && $.inArray(operatorId, this.idList) != -1) {
        return lzm_commonTools.clone(this.objects[operatorId]);
    } else if (searchBy == 'name') {
        var resultList = [];
        for (var i=0; i<this.idList.length; i++) {
            if (this.getOperator(this.idList[i]).name == operatorId) {
                resultList.push(this.getOperator(this.idList[i]));
            }
        }
        return resultList;
    } else if(searchBy == 'uid' && typeof this.uidList[operatorId] != 'undefined') {
        return this.getOperator(this.uidList[operatorId]);
    } else {
        return null;
    }
};

LzmOperators.prototype.removeOperator = function(operatorId) {
    var operator = this.getOperator(operatorId);
    if (operator != null) {
        var tmpArray = [];
        for (var i=0; i<this.idList.length; i++) {
            if (this.idList[i] != operatorId) {
                tmpArray.push(this.idList[i]);
            }
        }
        this.idList = tmpArray;
        var uid = operator.userid;
        delete this.objects[operatorId];
        delete this.uidList[uid];
    }
};

LzmOperators.prototype.clearOperators = function() {
    this.idList = [];
    this.objects = {};
    this.uidList = {};
};

LzmOperators.prototype.getOperatorList = function(sortCriteria, searchBy, showOfflineOperators, includeBots) {
    sortCriteria = (typeof sortCriteria != 'undefined' && sortCriteria != '') ? sortCriteria : 'name';
    searchBy = (typeof searchBy != 'undefined') ? searchBy : '';
    includeBots = (typeof includeBots != 'undefined') ? includeBots : true;
    showOfflineOperators = (typeof showOfflineOperators != 'undefined') ? showOfflineOperators : true;
    var that = this, sortedOperatorList = [], sortedIdList = [], i = 0;
    if (searchBy == '') {
        sortedIdList = lzm_commonTools.clone(this.idList);
    } else {
        for (i=0; i<this.idList.length; i++) {
            if ($.inArray(searchBy, this.getOperator(this.idList[i]).groups) != -1 && (showOfflineOperators || this.getOperator(this.idList[i]).status != 2)) {
                sortedIdList.push(this.idList[i]);
            }
        }
    }

    var sortOperators = function(a, b) {
        var rtValue = 0;
        if (that.getOperator(a)[sortCriteria].toLowerCase() > that.getOperator(b)[sortCriteria].toLowerCase()) {
            rtValue = 1;
        } else if (that.getOperator(a)[sortCriteria].toLowerCase() < that.getOperator(b)[sortCriteria].toLowerCase()) {
            rtValue = -1;
        }
        return rtValue;
    };

    sortedIdList.sort(sortOperators);
    for (i=0; i<sortedIdList.length; i++) {
        if(includeBots || typeof this.getOperator(sortedIdList[i]).isbot == 'undefined' || this.getOperator(sortedIdList[i]).isbot != 1)
            sortedOperatorList.push(this.getOperator(sortedIdList[i]));
    }

    return sortedOperatorList;
};

LzmOperators.prototype.setLogo = function(operatorId, logo) {
    this.objects[operatorId].logo = logo;
};

LzmOperators.prototype.getOperatorCount = function() {
    var that = this;
    var myOperators = that.getOperatorList('', '', true);
    var operatorCount = myOperators.length;
    return operatorCount;
};

LzmOperators.prototype.GetActiveOperators = function(_exclude) {
    var list = [];
    for (var key in this.objects)
    {
        var op = this.objects[key];
        if(op.isbot==0 && $.inArray(op.id,_exclude) == -1 && op.status != '2')
            list.push(op);
    }
    return list;
};

LzmOperators.prototype.getAvailableOperators = function(_chatSystemId) {
    var that = this, myId = (typeof lzm_chatDisplay != 'undefined') ? lzm_chatDisplay.myId : '';
    var avOps = {'forward': [], fIdList: [], 'invite': [], iIdList: []};
    var operators = that.getOperatorList();
    var chatObj = DataEngine.ChatManager.GetChat(_chatSystemId);
    for (var i=0; i<operators.length; i++)
    {
        if (operators[i].id != myId && $.inArray(parseInt(operators[i].status), [0,1]) != -1 && operators[i].groups.length > operators[i].groupsAway.length)
        {
            avOps['forward'].push(operators[i]);
            avOps['fIdList'].push(operators[i].id);
            var opPerms = operators[i].perms.split('');

            if (opPerms[7] == 1 && (opPerms[13] == 2 || (opPerms[13] == 1 && chatObj != null && $.inArray(chatObj.dcg, operators[i].groups) != -1)))
            {
                avOps['invite'].push(operators[i]);
                avOps['iIdList'].push(operators[i].id);
            }
        }
    }
    return avOps;
};

function ChatPostController(){
    this.previousMessageSender='';
    this.previousMessageRepost=1;
    this.previousAddMessageStyle=1;
    this.previousMessageTimestamp = 0;
    this.chatObj=null;
    this.postObj = null;
    this.html = '';
}

function LzmGroups() {
    this.idList = [];
    this.objects = {};
    this.oldGroupMembers = {};
}

LzmGroups.prototype.setGroup = function(group) {
    if ($.inArray(group.id, this.idList) == -1)
    {
        this.idList.push(group.id);
    }
    this.objects[group.id] = group;
    if (typeof  group.members != 'undefined' && typeof DataEngine != 'undefined')
    {
        if (typeof this.oldGroupMembers[group.id] == 'undefined')
        {
            this.oldGroupMembers[group.id] = group.members;
        }

        var i, j, oldGroupMemberId, operator, userName;
        var visitorChat = null;
        var groupChat = DataEngine.ChatManager.GetChat(group.id);

        try
        {
            for (i=0; i<group.members.length; i++)
            {
                var memberHasJoined = true;
                userName = "";
                for (j=0; j<this.oldGroupMembers[group.id].length; j++)
                {
                    oldGroupMemberId = this.oldGroupMembers[group.id][j].i;
                    if (oldGroupMemberId == group.members[i].i) {
                        memberHasJoined = false;
                    }
                }
                if (memberHasJoined)
                {
                    operator = DataEngine.operators.getOperator(group.members[i].i);
                    visitorChat = DataEngine.ChatManager.GetChat(group.members[i].i);

                    if(operator == null)
                    {
                        try
                        {
                            userName = visitorChat.GetName();
                        }
                        catch(e)
                        {
                            return false;
                        }
                    }
                    else
                        userName = operator.name;

                    if (groupChat != null)
                    {
                        addJoinedMessageToChat(group.id, userName, group.name);
                    }
                    else if (group.members[i].i == DataEngine.myId)
                    {
                        OpenChatTab(group.id);
                        addJoinedMessageToChat(group.id, userName, group.name);
                    }
                }
            }
        }
        catch(e)
        {
            deblog(e);
        }

        try
        {
            for (i=0; i<this.oldGroupMembers[group.id].length; i++)
            {
                oldGroupMemberId = this.oldGroupMembers[group.id][i].i;
                var membersHasLeft = true;
                for (j=0; j<group.members.length; j++)
                {
                    if (group.members[j].i == oldGroupMemberId)
                    {
                        membersHasLeft = false;
                    }
                }
                if (membersHasLeft)
                {
                    operator = DataEngine.operators.getOperator(oldGroupMemberId);
                    visitorChat = DataEngine.ChatManager.GetChat(oldGroupMemberId);

                    if(operator == null)
                    {
                        try
                        {
                            userName = visitorChat.GetName();
                        }
                        catch(e)
                        {
                            return false;
                        }
                    }
                    else
                        userName = operator.name;

                    if (groupChat != null)
                    {
                        addLeftMessageToChat(groupChat, userName, group.name);

                        var groupChatObj = DataEngine.ChatManager.GetChat(group.id);

                        if(groupChatObj != null)
                        {
                            if(visitorChat != null && visitorChat.IsMember(DataEngine.myId) && visitorChat.IsHost(DataEngine.myId))
                            {
                                visitorChat.WasInPublicChatGroup = true;
                                groupChatObj.CloseChatTab();
                                visitorChat.OpenChatTab();
                            }
                            else if(operator != null && operator.id == lzm_chatDisplay.myId)
                            {
                                groupChatObj.CloseChatTab();
                                showAllchatsList(true);
                            }
                        }
                    }
                }
            }
        }
        catch(e)
        {
            deblog(e);
        }

        this.oldGroupMembers[group.id] = lzm_commonTools.clone(group.members);
    }

    if (typeof this.objects[group.id] != 'undefined')
    {
        return this.objects[group.id];
    }
    else
    {
        return null;
    }

};

LzmGroups.prototype.copyGroup = function(group) {

    if ($.inArray(group.id, this.idList) == -1) {
        this.idList.push(group.id);
    }
    this.objects[group.id] = lzm_commonTools.clone(group);
    try {
        this.oldGroupMembers[group.id] = lzm_commonTools.clone(group.members);
    } catch(ex) {
        this.oldGroupMembers[group.id] = [];
    }
};

LzmGroups.prototype.getGroup = function(groupId,clone) {
    clone = (d(clone)) ? clone : true;
    if ($.inArray(groupId, this.idList) != -1)
        return (clone) ? lzm_commonTools.clone(this.objects[groupId]) : this.objects[groupId];
    else
        return null;
};

LzmGroups.prototype.isChatGroup = function(groupId){
    var group = this.getGroup(groupId);
    return (group != null && typeof group.members != 'undefined');
}

LzmGroups.prototype.removeGroup = function(groupId, doErase) {
    doErase = (typeof doErase != 'undefined') ? doErase : false;
    if (!doErase) {
        if (typeof this.objects[groupId] != 'undefined') {
            this.objects[groupId].is_active = false;
        }
    } else {
        var tmpArray = [];
        for (var i=0; i<this.idList.length; i++) {
            if (this.idList[i] != groupId) {
                tmpArray.push(this.idList[i]);
            }
        }
        this.idList = tmpArray;
        delete this.objects[groupId];
        delete this.oldGroupMembers[groupId];
    }
};

LzmGroups.prototype.clearGroups = function() {
    var i = 0;
    for (i=0; i<this.idList.length; i++) {
        this.objects[this.idList[i]].is_active = false;
    }
    var tmpArray = [];
    for (i=0; i<this.idList.length; i++) {
        var group = this.getGroup(this.idList[i]);
        if (group != null && typeof group.i != 'undefined') {
            tmpArray.push(this.idList[i]);
        } else {
            delete this.objects[this.idList[i]];
            delete this.oldGroupMembers[this.idList[i]];
        }
    }
    this.idList = tmpArray;
};

LzmGroups.prototype.getGroupList = function(sortCriteria, showInactiveGroups, showDynamicGroups) {

    sortCriteria = (typeof sortCriteria == 'string' && sortCriteria != '') ? sortCriteria : 'name';
    showInactiveGroups = (typeof showInactiveGroups != 'undefined') ? showInactiveGroups : true;
    showDynamicGroups = (typeof showDynamicGroups != 'undefined') ? showDynamicGroups : false;
    var that = this, sortedGroupList = [], sortedIdList, i;
    sortedIdList = lzm_commonTools.clone(this.idList);

    var sortGroups = function(a, b) {
        var rtValue = 0;
        if (that.getGroup(a)[sortCriteria].toLowerCase() > that.getGroup(b)[sortCriteria].toLowerCase()) {
            rtValue = 1;
        } else if (that.getGroup(a)[sortCriteria].toLowerCase() < that.getGroup(b)[sortCriteria].toLowerCase()) {
            rtValue = -1;
        }
        return rtValue;
    };

    sortedIdList.sort(sortGroups);
    for (i=0; i<sortedIdList.length; i++) {
        if ((showInactiveGroups || this.getGroup(sortedIdList[i]).is_active) &&
            (showDynamicGroups || typeof this.getGroup(sortedIdList[i]).members == 'undefined')) {
            sortedGroupList.push(this.getGroup(sortedIdList[i]));
        }
    }

    return sortedGroupList;
};

LzmGroups.prototype.setGroupProperty = function(groupId, property, value) {
    var rt = null;
    try {
    if (typeof this.objects[groupId] != 'undefined') {
        this.objects[groupId][property] = lzm_commonTools.clone(value);
        rt = lzm_commonTools.clone(this.objects[groupId]);
    }
    } catch(ex) {}
    return rt;
};

LzmGroups.prototype.getGroupCount = function() {
    var that = this;
    var myGroups = that.getGroupList('', true, false);
    var groupCount = myGroups.length;

    return groupCount;
};

function LzmUserChats() {
    this.messageIdList = [];
    this.userChatObjects = {};
    this.chatMessageCounter = 0;
    this.chatList = [];
    this.broswerChatIds = [];
}

LzmUserChats.prototype.removeUserChat = function(id) {
    if (typeof this.userChatObjects[id] != 'undefined') {
        delete this.userChatObjects[id];
    }
};

LzmUserChats.prototype.isInPublicGroupChat = function(userChat){
    try
    {
        var ispgc = userChat.dgr;
        if(ispgc)
        {
            var obj = lzm_commonTools.GetElementByProperty(lzm_chatDisplay.publicGroupChats,'bid',userChat.b);
            if(!obj.length)
                lzm_chatDisplay.publicGroupChats.push({bid:userChat.b,cid:userChat.i,rem:false,tr:false,la:0});
            obj[0].la=lz_global_timestamp();
            obj[0].rem=false;
        }
        return ispgc;
    }
    catch(e){}
    return false;
};

LzmUserChats.prototype.wasInPublicGroupChat = function(bid){
    var obj = lzm_commonTools.GetElementByProperty(lzm_chatDisplay.publicGroupChats,'bid',bid);
    if(!obj.length)
        return false;
    return !obj[0].rem;
};

LzmUserChats.prototype.removeUserChatProperty = function(id, property) {
    if (typeof this.userChatObjects[id] != 'undefined') {
        delete this.userChatObjects[id][property];
    }
};

LzmUserChats.prototype.checkChatExistsAndAdd = function(chat_id) {
    var chatExists = $.inArray(chat_id, this.broswerChatIds) != -1;
    if (!chatExists) {
        this.broswerChatIds.push(chat_id);
    }
    return chatExists;
};

LzmUserChats.prototype.getChatList = function() {
    return lzm_commonTools.clone(this.chatList);
};

LzmUserChats.prototype.restoreUserChats = function(userChats) {
    var that = this, maxChatMessageCounter = that.chatMessageCounter, i = 0, x = '';
    for (x in userChats) {
        if (userChats.hasOwnProperty(x)) {
            for (i=0; i<userChats[x].messages.length; i++) {
                maxChatMessageCounter = Math.max(maxChatMessageCounter, parseInt(userChats[x].messages[i].cmc));
                if ($.inArray(userChats[x].messages[i].id, that.messageIdList) == -1) {
                    that.messageIdList.push(userChats[x].messages[i].id);
                    that.chatList.push(userChats[x].messages[i]);
                }
            }
            if ($.inArray(userChats[x].chat_id, that.broswerChatIds) == -1) {
                that.broswerChatIds.push(userChats[x].chat_id);
            }
        }
    }
    for (x in userChats) {
        if (userChats.hasOwnProperty(x)) {
            if (typeof that.userChatObjects[x] == 'undefined') {
                that.userChatObjects[x] = userChats[x];
            } else {
                var tmpMessages = lzm_commonTools.clone(that.userChatObjects[x].messages);
                for (i=0; i<that.userChatObjects[x].messages.length; i++) {
                    var newMessage = that.userChatObjects[x].messages[i];
                    newMessage.cmc += maxChatMessageCounter;
                    tmpMessages.push(newMessage);
                }
            }
        }
    }
};

LzmUserChats.prototype.clearChatMessages = function(id){

    if (typeof this.userChatObjects[id] != 'undefined'){
        var infoHeader = null;
        var cList = lzm_commonTools.clone(this.userChatObjects[id].messages);
        this.userChatObjects[id].messages = [];
        for(var i = 0;i<cList.length;i++){
            if(typeof cList[i].info_header != 'undefined' && cList[i].info_header.operators == lzm_chatDisplay.myName)
                infoHeader = cList[i];
        }
        if(infoHeader != null)
            this.userChatObjects[id].messages[0] = infoHeader;
    }
}

function LzmResources() {
    this.idList = [];
    this.objects = {};
}

LzmResources.prototype.setResource = function(resource) {
    if ($.inArray(resource.rid, this.idList) == -1) {
        this.idList.push(resource.rid);
    }
    var usageCounter = (typeof this.objects[resource.rid] != 'undefined' && typeof this.objects[resource.rid].usage_counter != 'undefined') ?
        this.objects[resource.rid].usage_counter : (typeof resource.usage_counter != 'undefined') ? resource.usage_counter : 0;
    resource.usage_counter = usageCounter;
    this.objects[resource.rid] = resource;

};

LzmResources.prototype.getResource = function(resourceId) {
    if (typeof this.objects[resourceId] != 'undefined') {
        return lzm_commonTools.clone(this.objects[resourceId]);
    } else {
        return null;
    }
};

LzmResources.prototype.getResourceList = function(sortCriteria, searchBy, fullList) {
    sortCriteria = (typeof sortCriteria != 'undefined' && sortCriteria != '') ? sortCriteria : 'ti';
    searchBy = (typeof searchBy != 'undefined') ? searchBy : {};
    fullList = (typeof fullList != 'undefined') ? fullList : false;

    var that = this, sortedResourceList = [], tmpIdList = [], sortedIdList = [], i = 0;
    if (Object.keys(searchBy).length == 0) {
        sortedIdList = lzm_commonTools.clone(this.idList);
    }
    else
    {
        if (typeof searchBy.ty != 'undefined') {
            for (i=0; i<this.idList.length; i++)
            {
                if ($.inArray(this.getResource(this.idList[i]).ty, searchBy.ty.split(',')) != -1)
                {
                    tmpIdList.push(this.idList[i]);
                }
            }
        }
        else
        {
            tmpIdList = lzm_commonTools.clone(this.idList);
        }

        var sortByOtherCriteria = false;
        for (i=0; i<tmpIdList.length; i++)
        {
            if (typeof searchBy.ti != 'undefined')
            {
                sortByOtherCriteria = true;
                if (this.getResource(tmpIdList[i]).ti.toLowerCase().indexOf(searchBy.ti.toLowerCase()) != -1) {
                    if ($.inArray(tmpIdList[i], sortedIdList) == -1) {
                        sortedIdList.push(tmpIdList[i]);
                    }
                }
            }
            if (typeof searchBy.text != 'undefined') {
                sortByOtherCriteria = true;
                var thisResource = this.getResource(tmpIdList[i]);
                if (thisResource.ty != 3 && thisResource.ty != 4) {
                    var qrdText = thisResource.text.toLowerCase().replace(/<.*?>/g, '');
                    if (qrdText.indexOf(searchBy.text.toLowerCase()) != -1) {
                        if ($.inArray(tmpIdList[i], sortedIdList) == -1) {
                            sortedIdList.push(tmpIdList[i]);
                        }
                    }
                }
            }
            if (typeof searchBy.t != 'undefined') {
                sortByOtherCriteria = true;
                if (this.getResource(tmpIdList[i]).t.toLowerCase().indexOf(searchBy.t.toLowerCase()) != -1) {
                    if ($.inArray(tmpIdList[i], sortedIdList) == -1) {
                        sortedIdList.push(tmpIdList[i]);
                    }
                }
            }
            if (typeof searchBy.s != 'undefined') {
                sortByOtherCriteria = true;
                if (searchBy.s != '/' && ('/' + this.getResource(tmpIdList[i]).s.toLowerCase()).indexOf(searchBy.s.toLowerCase()) == 0) {
                    if ($.inArray(tmpIdList[i], sortedIdList) == -1) {
                        sortedIdList.push(tmpIdList[i]);
                    }
                }
            }
            if (typeof searchBy.parent != 'undefined') {
                sortByOtherCriteria = true;
                if (searchBy.parent == this.getResource(tmpIdList[i]).pid) {
                    if ($.inArray(tmpIdList[i], sortedIdList) == -1) {
                        sortedIdList.push(tmpIdList[i]);
                    }
                }
            }
        }
        if (!sortByOtherCriteria)
        {
            sortedIdList = tmpIdList;
        }
    }

    var sortResources = function(a, b) {
        var sortA = (typeof that.getResource(a)[sortCriteria] == 'string') ? that.getResource(a)[sortCriteria].toLowerCase() : that.getResource(a)[sortCriteria];
        var sortB = (typeof that.getResource(b)[sortCriteria] == 'string') ? that.getResource(b)[sortCriteria].toLowerCase() : that.getResource(b)[sortCriteria];
        var rtValue = 0;
        if (sortA > sortB) {
            rtValue = 1;
        } else if (sortA < sortB) {
            rtValue = -1;
        } else if (sortCriteria != 'ti' && that.getResource(a).ti.toLowerCase() < that.getResource(b).ti.toLowerCase()) {
            rtValue = 0.5;
        } else if (sortCriteria != 'ti' && that.getResource(a).ti.toLowerCase() > that.getResource(b).ti.toLowerCase()) {
            rtValue = -0.5;
        }
        rtValue = (sortCriteria == 'usage_counter') ? 0 - rtValue : rtValue;
        return rtValue;
    };
    sortedIdList.sort(sortResources);
    for (i=0; i<sortedIdList.length; i++) {

        var res = this.getResource(sortedIdList[i]);
        if (fullList || res.rid=="1" || lzm_commonPermissions.checkUserResourceReadPermission(lzm_chatDisplay.myId, res, this.getResource(res.pid)))
            sortedResourceList.push(res);
    }

    return sortedResourceList;
};

LzmResources.prototype.removeResource = function(resourceId) {
    if (typeof this.objects[resourceId] != 'undefined') {
        var tmpArray = [];
        for (var i=0; i<this.idList.length; i++) {
            if (this.idList[i] != resourceId) {
                tmpArray.push(this.idList[i]);
            }
        }
        this.idList = tmpArray;
        delete this.objects[resourceId];
    }
};

LzmResources.prototype.setResourceProperty = function(resourceId, property, value) {
    if (typeof this.objects[resourceId] != 'undefined') {
        this.objects[resourceId][property] = value;
    }
};

LzmResources.prototype.riseUsageCounter = function(resourceId) {
    if (typeof this.objects[resourceId] != 'undefined') {
        this.objects[resourceId]['usage_counter']++;
    }
};

function LzmReports() {
    this.idList = [];
    this.objects = {};
    this.totalReports = 0;
    this.matchingReports = 0;
    this.reportsPerPage = 20;
}

LzmReports.prototype.setReport = function(report) {
    try {
        this.idList.push(report.i);
        this.objects[report.i] = report;
    } catch(ex) {}
};

LzmReports.prototype.getReport = function (reportId) {
    if (typeof this.objects[reportId] != 'undefined') {
        return lzm_commonTools.clone(this.objects[reportId]);
    } else {
        return null;
    }
};

LzmReports.prototype.getReportList = function() {
    var reportList = [];
    for (var i=0; i<this.idList.length; i++) {
        reportList.push(lzm_commonTools.clone(this.objects[this.idList[i]]));
    }
    return reportList;
};

LzmReports.prototype.clearReports = function() {
    this.idList = [];
    this.objects = {};
};

LzmReports.prototype.setTotal = function(number) {
    this.totalReports = parseInt(number);
};

LzmReports.prototype.getTotal = function() {
    return this.totalReports;
};

LzmReports.prototype.setMatching = function(number) {
    this.matchingReports = parseInt(number);
};

LzmReports.prototype.getMatching = function() {
    return this.matchingReports;
};

LzmReports.prototype.setReportsPerPage = function(number) {
    this.reportsPerPage = parseInt(number);
};

LzmReports.prototype.getReportsPerPage = function() {
    return this.reportsPerPage;
};




function Chat(_copy){
    this.Logs = [];
    this.Members = [];
    this.PreviousMembers = [];
    this.Browser = null;
    this.Visitor = null;
    this.SystemId = null;
    this.Messages = [];
    this.Type = Chat.Visitor;
    this.TabOpen = false;
    this.IndicateTyping = false;
    this.IsUnread = true;
    this.NotificationsSent = false;
    this.AutoAcceptMessage = null;
    this.AutoForwardCountdown = null;
    this.AutoForwardTarget = null;
    this.AutoForwardTimeLeft = -1;
    this.AcceptInitiated = false;
    this.WasInPublicChatGroup = false;
    this.SpellCheckLanguage = '';

    if(d(_copy))
        this.CopyFrom(_copy);
}

Chat.Visitor = 0;
Chat.Operator = 1;
Chat.ChatGroup = 2;
Chat.Open = 0;
Chat.Queue = 1;
Chat.Active = 2;
Chat.Closed = 3;
Chat.StatusHost = 0;
Chat.StatusFollower = 1;
Chat.StatusFollowerInvisible = 2;

Chat.prototype.IsActive = function(){
    return (this.ai=='1' && this.ai=='1');
};

Chat.prototype.IsAccepted = function(){
    return this.IsActive();
};

Chat.prototype.GetStatus = function(){
    if(this.c=='1' || this.IsDeclined())
        return Chat.Closed;
    if(this.ai=='1')
        return Chat.Active;
    if(this.w=='1')
        return Chat.Queue;
    else
        return Chat.Open;
};

Chat.prototype.ClosedBy = function(){
    if(this.ce=='1')
        return Chat.Visitor;
    else if(this.ci=='1')
        return Chat.Operator;
    else
        return -1;
};

Chat.prototype.AddMessage = function(_messageObj,_openTab){
    if(!lzm_commonTools.GetElementByProperty(this.Messages,'id',_messageObj.id).length)
    {
        if(!d(_messageObj.Formatted))
            _messageObj = Chat.FormatPost(_messageObj);
        _openTab = d(_openTab) ? _openTab : true;
        this.Messages.push(_messageObj);
        if(_openTab && this.GetStatus() != Chat.Queue)
            this.OpenChatTab();
        this.IsUnread = true;

        var ctse = (typeof lzm_chatDisplay.chatTranslations[this.GetFullId()] != 'undefined');
        if (typeof _messageObj.triso != 'undefined' && _messageObj.triso != '' && _messageObj.sen.indexOf('~') != -1)
        {
            var i,userLang = '', shortUserLang = '';
            for (i=0; i<lzm_chatDisplay.translationLanguages.length; i++)
            {
                if (lzm_chatDisplay.translationLanguages[i].language == DataEngine.userLanguage)
                    userLang = DataEngine.userLanguage;
                if (lzm_chatDisplay.translationLanguages[i].language == DataEngine.userLanguage.split('-')[0])
                    shortUserLang = DataEngine.userLanguage.split('-')[0];
            }
            userLang = (userLang != '') ? userLang : shortUserLang;
            var tmm = {translate: false, sourceLanguage: userLang, targetLanguage: userLang};
            var tvm = {translate: false, sourceLanguage: userLang, targetLanguage: userLang};
            if (!ctse)
            {
                lzm_chatDisplay.chatTranslations[this.GetFullId()] = {
                    tmm: tmm,
                    tvm: tvm
                };
            }
            lzm_chatDisplay.chatTranslations[this.GetFullId()].tvm.translate = true;
            lzm_chatDisplay.chatTranslations[this.GetFullId()].tvm.sourceLanguage = _messageObj.triso;
            lzm_chatDisplay.updateTranslateButtonUI(this.GetFullId());
        }
        else if(ctse && lzm_chatDisplay.chatTranslations[this.GetFullId()].tvm.translate)
        {
            lzm_chatDisplay.chatTranslations[this.GetFullId()].tvm.translate = false;
            lzm_chatDisplay.updateTranslateButtonUI(this.GetFullId());
        }
    }
};

Chat.prototype.IsMissed = function(){
    return (this.ai!='1' && this.GetStatus()==Chat.Closed);
};

Chat.prototype.IsMember = function(_userId){
    if(this.IsChatGroup())
    {
        var group = DataEngine.groups.getGroup(this.SystemId);
        return lzm_commonTools.GetElementByProperty(group.members,'i',_userId).length>0;
    }
    else
    {
        for(var key in this.Members)
            if(_userId == this.Members[key].i && this.Members[key].d=='0')
                return true;
    }
    return false;
};

Chat.prototype.IsHiddenMember = function(_operatorId){
    for(var key in this.Members)
        if(_operatorId == this.Members[key].i && this.Members[key].s==Chat.StatusFollowerInvisible)
            return true;
    return false;
};

Chat.prototype.HasDeclined = function(_operatorId){
    for(var key in this.Members)
        if(_operatorId == this.Members[key].i && this.Members[key].d=='1')
            return true;
    return false;
};

Chat.prototype.GetMember = function(_operatorId){
    for(var key in this.Members)
        if(_operatorId == this.Members[key].i)
            return this.Members[key];
    return null;
};

Chat.prototype.GetMemberStatus = function(_operatorId){
    for(var key in this.Members)
        if(_operatorId == this.Members[key].i)
            return this.Members[key].s;
    return -1;
};

Chat.prototype.GetOperatorsLeft = function(){
    var left = [];
    for(var key in this.Members)
        if(this.Members[key].d != '1' && this.Members[key].s != Chat.StatusFollowerInvisible)
            left.push(this.Members[key]);
    return left;
};

Chat.prototype.IsDeclined = function(){
    if(this.di=='1')
        return true;
    for(var key in this.Members)
        if(this.Members[key].d != '1' && this.Members[key].s != Chat.StatusFollowerInvisible)
            return false;
    return (this.Members).length>0;
};

Chat.prototype.IsBotChat = function(){
    for(var key in this.Members)
    {
        var op = DataEngine.operators.getOperator(this.Members[key]);
        if(op != null && op.isbot)
            return true;
    }
    return false;
};

Chat.prototype.GetChatGroup = function(){
    var groups = DataEngine.groups.getGroupList('name',false,true);
    for(var key in groups)
    {
        var group = groups[key];
        if(d(group.members) && lzm_commonTools.GetElementByProperty(group.members,'i',this.SystemId).length)
        {
            return group;
        }
    }
    return null;
};

Chat.prototype.IsChatGroup = function(){
    var group = DataEngine.groups.getGroup(this.SystemId);
    return (group != null && d(group.members));
};

Chat.prototype.IsHost = function(_operatorId){
    if(this.Members.length>0)
        if(_operatorId == this.Members[0].i && this.Members[0].d=='0' && this.Members[0].s==Chat.StatusHost)
            return true;
    return false;
};

Chat.prototype.GetName = function(_maxlength,_raw){

    var name = '';
    _maxlength = (d(_maxlength)) ? _maxlength : 1024;
    _raw = (d(_raw)) ? _raw : false;

    if(this.Type==Chat.Visitor)
    {
        name = DataEngine.inputList.getInputValueFromVisitor(111,this.Visitor,_maxlength,_raw);
        if(!name.length && this.Visitor)
        {
            name = this.Visitor.unique_name;
        }
    }
    else if(this.Type==Chat.ChatGroup)
    {
        if(this.SystemId=="everyoneintern")
            name = tid('all_operators');
        else
            name = DataEngine.groups.getGroup(this.SystemId).name;
    }
    else if(this.Type==Chat.Operator)
        name = DataEngine.operators.getOperator(this.SystemId).name;

    return name;
};

Chat.prototype.GetFullId = function(){
    return this.v + '~' + this.b + '~' + this.i;
};

Chat.prototype.CopyFrom = function(_copyChat){
    for(var key in _copyChat)
        if(typeof _copyChat[key] !== 'function')
            this[key] = lzm_commonTools.clone(_copyChat[key]);
};

Chat.prototype.UpdateMembers = function(_newMemberList){
    for(var key in this.Members)
        if(!lzm_commonTools.GetElementByProperty(this.PreviousMembers,'i',this.Members[key].i).length && !lzm_commonTools.GetElementByProperty(_newMemberList,'i',this.Members[key].i).length)
            this.PreviousMembers.push(lzm_commonTools.clone(this.Members[key]));
    this.Members = _newMemberList;
};

Chat.prototype.OpenChatTab = function(){

    if(!this.TabOpen && this.Type == Chat.Visitor && this.GetMember(DataEngine.myId) == null && !this.IsChatGroup())
        return;

    if(!this.TabOpen && this.Type == Chat.Visitor && this.GetStatus() == Chat.Closed)
        return;

    this.TabOpen = (this.GetChatGroup()==null||this.Type!=Chat.Visitor);
};

Chat.prototype.CloseChatTab = function(){
    this.TabOpen = false;
};

Chat.prototype.CanPreview = function (_memberId){
    if(this.IsMember(_memberId) || this.GetStatus() == Chat.Queue || this.GetStatus() == Chat.Open || this.IsMissed())
        return true;

    if(!lzm_commonPermissions.checkUserPermissions(_memberId, 'chats', 'join_invisible', {}))
        return false;

    return true;
};

Chat.prototype.GetAvatarObject = function (){
    if(!LocalConfiguration.UIShowAvatars)
        return '';
    if(this.Type != Chat.Visitor)
        return '<div style="background-image: url(\'./../picture.php?intid='+lz_global_base64_url_encode(this.SystemId)+'\');"></div>';
    else
        return '<div style="background-image: url(\'./../picture.php?name='+lz_global_base64_url_encode(this.GetName())+'\');"></div>';
};

Chat.FormatPost = function(_post){

    var tmpdate = lzm_chatTimeStamp.getLocalTimeObject(_post.date * 1000, true);
    _post.date_human = lzm_commonTools.getHumanDate(tmpdate, 'date', DataEngine.userLanguage);
    _post.time_human = lzm_commonTools.getHumanDate(tmpdate, 'time', DataEngine.userLanguage);
    _post.dateObject = {
        day: lzm_commonTools.pad(tmpdate.getDate(), 2),
        month: lzm_commonTools.pad((tmpdate.getMonth() + 1), 2),
        year: lzm_commonTools.pad(tmpdate.getFullYear() ,4)
    };

    tmpdate = lzm_chatTimeStamp.getLocalTimeObject();
    var currentDateObject = {
        day:lzm_commonTools.pad(tmpdate.getDate(), 2),
        month:lzm_commonTools.pad((tmpdate.getMonth() + 1), 2),
        year:lzm_commonTools.pad(tmpdate.getFullYear() ,4)
    };
    if(_post.dateObject.year != currentDateObject.year || _post.dateObject.month != currentDateObject.month || _post.dateObject.day != currentDateObject.day)
        _post.time_human = _post.date_human + '&nbsp;' + _post.time_human;

    if(!d(_post.m))
        _post.m = lz_global_microstamp();

    while(_post.m.length < 10)
        _post.m = '0' + _post.m;

    _post.mtime = _post.date + "_" + _post.m;
    _post.Formatted = true;

    return _post;
};

Chat.ProcessPostCommands = function(_post){

    if(_post.text.indexOf('[__[') !== -1 && _post.text.indexOf(']__]') !== -1)
    {
        var chatId,chatObj,parts = _post.text.replace(']__]','').split('[__[');

        _post.textOriginal =
        _post.text = parts[0];

        if(parts[1].startsWith('file:'))
        {
            var fileId = parts[1].replace('file:','');
            var res = {ti:_post.text,rid:fileId};
            var url = getQrdDownloadUrl(res);

            _post.textOriginal =
            _post.text = '<a target="_blank" href="'+url+'">' + res.ti + '</a>';
            _post.warn = true;
        }
        else if(parts[1].startsWith('invite_info:'))
        {
            chatId = parts[1].replace('invite_info:','');
            showInvitedMessage(chatId,_post.sen_id,_post.text);
            return null;
        }
        else if(parts[1].startsWith('forward_info:'))
        {

            _post.textOriginal =
            _post.text = '<i>'+_post.text+'</i>';

            chatId = parts[1].replace('forward_info:','');
            _post.warn = true;
            chatObj = DataEngine.ChatManager.GetChat(chatId,'i');
            if(chatObj != null)
            {
                _post.rec = chatObj.SystemId;
                _post.reco = chatObj.SystemId;
            }
        }
        else if(parts[1].startsWith('auto_forward:'))
        {
            chatId = parts[1].replace('auto_forward:','');
            chatObj = DataEngine.ChatManager.GetChat(chatId,'i');
            if(chatObj.AutoForwardCountdown==null)
            {
                chatObj.AutoForwardTimeLeft = 10;
                chatObj.AutoForwardCountdown = setInterval(function(){lzm_chatDisplay.UpdateAutoForwardUI(chatObj,true);},1000);
                chatObj.AutoForwardTarget = _post.text;
            }
            return null;
        }
    }
    return _post;
};

Chat.RemovePostsCommands = function(_container){
    $('#' + _container + ' div').each(function(){
        var post = {text:$(this).html()};
        if(post.text.length<300)
        {
            var mpost = Chat.ProcessPostCommands(lzm_commonTools.clone(post));
            if(mpost.text != post.text)
                $(this).html(mpost.text);
        }
    });
};



function ChatManager(){
    this.Chats = [];
    this.DataUpdateTime=null;
}

ChatManager.ActiveChat = 'LIST';
ChatManager.LastActiveChat = 'LIST';
ChatManager.Counts={};
ChatManager.DLChatMessagesList=[];

ChatManager.prototype.SetActiveChat = function (_id) {
    ChatManager.LastActiveChat = ChatManager.ActiveChat;
    ChatManager.ActiveChat = _id;
    if(_id != 'LIST')
    {
        var co = this.GetChat();
        co.IsUnread = false;
        co.OpenChatTab();
    }
};

ChatManager.prototype.OpenChatTab = function(_id){
    this.GetChat(_id).OpenChatTab();
};

ChatManager.prototype.CloseChatTab = function(_id){
    this.GetChat(_id).CloseChatTab();
};

ChatManager.prototype.CanPreview = function (_chatId,_memberId){
    var chat = this.GetChat(_chatId,'i');
    if(chat != null && chat.CanPreview(_memberId))
        return true;
    return false;
};

ChatManager.prototype.AddInternalChat = function(_systemId,_type) {
    var exChatObject = this.GetChat(_systemId);
    if(exChatObject==null)
    {
        exChatObject = new Chat();
        exChatObject.Type = _type;
        exChatObject.SystemId = _systemId;
        this.Chats.push(exChatObject);
    }
};

ChatManager.prototype.AddVisitorChat = function(_obj,_newPosts) {

    var oldCopy=null,isNew=false,exChatObject = this.GetChat(_obj.i,'i');
    var visitor = VisitorManager.GetVisitor(_obj.v);
    var browser = VisitorManager.GetLastActiveVisitorBrowser(_obj.v);
    var status = null;

    if(exChatObject == null)
    {
        if(visitor == null)
        {
            return null;
        }

        if(browser == null)
        {
            if(_obj.GetStatus() != Chat.Closed)
                return null;
        }

        // new
        exChatObject = _obj;
        this.Chats.push(exChatObject);

        isNew = true;
        exChatObject.TabOpen = true;
        if(exChatObject.GetStatus() == Chat.Closed || !exChatObject.IsMember(DataEngine.myId))
        {
            exChatObject.TabOpen = false;
            exChatObject.IsUnread = false;
        }

        status = exChatObject.GetStatus();
    }
    else
    {
        // update
        oldCopy = new Chat(exChatObject);

        for(var key in _obj)
            if(key[0].toString() !== key[0].toString().toUpperCase())
            {
                if(exChatObject[key] != _obj[key])
                    exChatObject[key] = _obj[key];
            }


        status = exChatObject.GetStatus();
        exChatObject.UpdateMembers(_obj.Members);

        if(status == Chat.Closed)
            exChatObject.IsUnread = false;

        if(exChatObject.GetChatGroup() != null)
            exChatObject.TabOpen = false;

        if(status == Chat.Queue && status == Chat.Open && exChatObject.IsMember(DataEngine.myId))
            exChatObject.OpenChatTab();

        if(status == Chat.Active && exChatObject.a == 0)
            exChatObject.a = lz_global_timestamp();
    }

    if(visitor!=null)
    {
        if((!visitor.IsInChat && status != Chat.Closed) || (visitor.IsInChat && status == Chat.Closed))
        {
            visitor.IsInChat = status != Chat.Closed;
            visitor.WasInChat = true;
            visitor.is_vl_ui_update = true;
            VisitorManager.UpdateUI = true;
        }
        exChatObject.Visitor = lzm_commonTools.clone(visitor);
    }


    if(browser!=null)
        exChatObject.Browser = lzm_commonTools.clone(browser);

    exChatObject.SystemId = exChatObject.v + '~' + exChatObject.b;

    lzm_chatDisplay.ProcessChatUpdates(oldCopy,exChatObject,_newPosts);

    if(isNew)
    {
        addChatInfoBlock(_obj,exChatObject.TabOpen);
        if(exChatObject.GetStatus() == Chat.Closed)
            exChatObject.IsUnread = false;
    }

    return exChatObject;
};

ChatManager.prototype.GetChat = function(_key,_searchBy,_sort) {

    if(!d(_key) && d(ChatManager.ActiveChat))
        return this.GetChat(ChatManager.ActiveChat);

    _searchBy = d(_searchBy) ? _searchBy : 'SystemId';
    _sort = d(_sort) ? _sort : null;

    var maxChatId,k,list = lzm_commonTools.GetElementByProperty(this.Chats,_searchBy,_key);
    if(list.length)
    {
        if(_searchBy == 'SystemId' && list.length>1)
        {
            maxChatId = 0;
            for(k in list)
                maxChatId = Math.max(maxChatId,parseInt(list[k].i));
            return this.GetChat(maxChatId,'i');
        }

        if(_sort != null)
        {
            return lzm_commonTools.SortByProperty(list[0],_sort);
        }
        else
            return list[0];
    }
    return null;
};

ChatManager.prototype.GetChats = function(_type,_listMulti) {
    _type = (d(_type)) ? _type : null;
    _listMulti = (d(_listMulti)) ? _listMulti : false;
    var chat,list = [];
    for(var key in this.Chats)
        if(this.Chats[key].Type == _type || _type==null)
        {
            chat = this.Chats[key];
            if(this.Chats[key].Type==Chat.Visitor)
            {
                if(!_listMulti && chat.i != this.GetChat(chat.SystemId).i)
                    continue;
            }
            list.push(chat);
        }
    return list;
};

ChatManager.prototype.GetChatsOf = function(_operatorId,_status) {
    _status = (d(_status)) ? _status : ['all'];
    var list = [];
    for(var key in this.Chats)
        if(this.Chats[key].Type == Chat.Visitor && ($.inArray(this.Chats[key].GetStatus(),_status) != -1 || _status[0]=='all')  && this.Chats[key].IsMember(_operatorId))
        {
            list.push(this.Chats[key]);
        }
    return list;
};

ChatManager.prototype.GetMissed = function() {
    var missed = [];
    for(var key in this.Chats)
        if(this.Chats[key].Type == Chat.Visitor && this.Chats[key].IsMissed())
            missed.push(this.Chats[key]);
    return missed;
};

ChatManager.prototype.GetActive = function() {
    var active = [];
    for(var key in this.Chats)
        if(this.Chats[key].Type == Chat.Visitor && this.Chats[key].GetStatus()==Chat.Active)
            active.push(this.Chats[key]);
    return active;
};

ChatManager.prototype.GetQueued = function() {
    var queued = [];
    for(var key in this.Chats)
        if(this.Chats[key].Type == Chat.Visitor && this.Chats[key].GetStatus()==Chat.Queue)
            queued.push(this.Chats[key]);
    return queued;
};

ChatManager.prototype.ProcessVisitorChats = function(_xmlDoc) {

    try
    {
        var that = this;
        $(_xmlDoc).find('ext_cl').each(function ()
        {
            var ext_cl = $(this);
            var dut = lz_global_base64_url_decode(ext_cl.attr('dut'));

            if(dut>=that.DataUpdateTime)
            {
                that.DataUpdateTime = dut;

                $(ext_cl).find('c').each(function ()
                {
                    var chatXML = $(this);
                    var chatObj = new Chat();

                    // members
                    chatObj.Members = [];
                    $(chatXML).find('m').each(function ()
                    {
                        var memberXML = $(this);
                        var memberObj = {};
                        lzm_commonTools.ApplyFromXML(memberObj,memberXML[0].attributes);
                        chatObj.Members.push(memberObj);
                    });

                    lzm_commonTools.ApplyFromXML(chatObj,chatXML[0].attributes);
                    chatObj = that.AddVisitorChat(chatObj,false);


                });

                $(ext_cl).find('pc').each(function ()
                {
                    var chatXML = $(this);
                    var cid = lz_global_base64_url_decode(chatXML.attr('cid'));
                    var chatObj = that.GetChat(cid,'i');

                    // members

                    $(chatXML).find('val').each(function ()
                    {
                        var prpostXML = $(this);
                        var prpostObj = {};
                        lzm_commonTools.ApplyFromXML(prpostObj,prpostXML[0].attributes);

                        prpostObj.text = lz_global_htmlentities(lz_global_base64_url_decode(prpostXML.text()));
                        prpostObj.textOriginal = lz_global_base64_url_decode(prpostXML.text());
                        prpostObj = Chat.FormatPost(prpostObj);
                        prpostObj = Chat.ProcessPostCommands(prpostObj);

                        if(prpostObj != null)
                            chatObj.AddMessage(prpostObj,false);
                    });

                    // properties
                    lzm_commonTools.ApplyFromXML(chatObj,chatXML[0].attributes);
                    chatObj = that.AddVisitorChat(chatObj,true);
                });
            }
        });
        lzm_chatDisplay.ProcessChatIndication();
    }
    catch(ex)
    {
        deblog(ex);
    }
};

ChatManager.prototype.SetTyping = function(_systemId,_on) {
    for(var key in this.Chats)
        if(this.Chats[key].SystemId == _systemId || _systemId == 'all')
            this.Chats[key].IndicateTyping = _on;
};

ChatManager.prototype.WasMember = function(_systemId,_operatorId) {

    var chats = lzm_commonTools.GetElementByProperty(this.Chats,'SystemId',_systemId);
    for(var ckey in chats)
    {
        for(var key in chats[ckey].PreviousMembers)
            if(_operatorId == chats[ckey].PreviousMembers[key].i)
                return true;

        if(chats[ckey].IsMember(_operatorId))
            return true;
    }
    return false;
};

ChatManager.prototype.IsUnread = function(_checkPerm) {

    _checkPerm = (d(_checkPerm)) ? _checkPerm : false;
    for(var ckey in this.Chats)
    {
        var vperm = lzm_commonPermissions.checkUserChatPermissions(DataEngine.myId, 'view', this.Chats[ckey]);
        if(vperm || !_checkPerm || this.Chats[ckey].Type != Chat.Visitor)
            if(this.Chats[ckey].IsUnread)
                return true;
    }

    return false;
};

ChatManager.prototype.MarkClosedRead = function() {

    var wasChange = false;
    for(var ckey in this.Chats)
        if(this.Chats[ckey].IsUnread && this.Chats[ckey].GetStatus() == Chat.Closed)
        {
            this.Chats[ckey].IsUnread = false;
            wasChange = true;
        }
    return wasChange;
};

function VisitorManager(){}

VisitorManager.Visitors = [];
VisitorManager.DUTVisitors = 0;
VisitorManager.DUTVisitorBrowserEntrance = 0;
VisitorManager.DUTVisitorBrowserURLs = 0;
VisitorManager.LoadFullDataUserId = null;
VisitorManager.LoadFullDataChatsOnly = false;
VisitorManager.ActiveVisitors = 0;
VisitorManager.HiddenVisitors = 0;
VisitorManager.UpdateUI = false;
VisitorManager.QueuedBrowsers = [];
VisitorManager.QueuedURLS = [];

VisitorManager.AddVisitor = function(_obj){

    var existing = VisitorManager.GetVisitor(_obj.i);
    if(existing == null)
    {
        VisitorManager.Visitors.push(_obj);
        existing = _obj;

        NotificationManager.NotifyVisitor(_obj);
    }
    else
    {
        existing.ed =_obj.ed;
        existing.d =_obj.d;
        existing.c =_obj.c;
        existing.is_vi_ui_update =
        existing.is_vl_ui_update = true;
    }

    existing.unique_name = t('Visitor <!--visitor_number-->',[['<!--visitor_number-->',VisitorManager.GetUniqueName(existing.id + existing.ip)]]);

    if(!d(existing.r))
        existing.r = [];

    if(!d(existing.IsInChat))
        existing.IsInChat = false;

    if(!d(existing.WasInChat))
        existing.WasInChat = false;

    if(!d(existing.is_drawn))
        existing.is_drawn = false;

    if(!d(existing.IsLoaded))
        existing.IsLoaded = false;

    if(!d(existing.is_vl_ui_update))
        existing.is_vl_ui_update = false;

    if(!d(existing.is_vi_ui_update))
        existing.is_vi_ui_update = false;

    if(!d(existing.full_data))
        existing.full_data = false;

    VisitorManager.SetVisitorHidden(existing);
    VisitorManager.AddBrowsersToVisitorFromQueue(existing);
};

VisitorManager.AddBrowser = function(_obj){

    var visKey, found = false;

    _obj.c = parseInt(_obj.c);
    for(var vkey in VisitorManager.Visitors)
    {
        if(VisitorManager.Visitors[vkey].i == _obj.v)
        {
            found = true;
            visKey = vkey;
            if(!d(VisitorManager.Visitors[visKey].b))
                VisitorManager.Visitors[visKey].b = [];


            _obj.last_browse = 0;

            var browserKey = null;
            for(var key in VisitorManager.Visitors[visKey].b)
            {
                if(VisitorManager.Visitors[visKey].b[key].id == _obj.id)
                    browserKey = key;
            }

            if(browserKey == null && _obj.c == 0)
                VisitorManager.Visitors[visKey].b.push(_obj);
            else if(browserKey != null)
                VisitorManager.Visitors[visKey].b[browserKey].c = _obj.c;
            else if(d(VisitorManager.Visitors[visKey].rv))
            {
                var rvSession = lzm_commonTools.GetElementByProperty(VisitorManager.Visitors[visKey].rv,'id',_obj.vi);
                if(rvSession.length)
                {
                    if(!d(rvSession[0].b))
                        rvSession[0].b = [];

                    rvSession[0].b.push(_obj);
                }
            }
            VisitorManager.Visitors[visKey].is_vi_ui_update =
            VisitorManager.Visitors[visKey].is_vl_ui_update = true;
        }
    }

    if(!found && _obj.c == 0)
    {
        VisitorManager.QueuedBrowsers.push(_obj);
    }

    VisitorManager.AddURLSToBrowserFromQueue(_obj);

};

VisitorManager.AddURL = function(_obj){

    var key,rkey,bkey;
    function setData(_visitor,_browser){
        _visitor.is_vi_ui_update =
            _visitor.is_vl_ui_update = true;
        if(!d(_browser.h2))
            _browser.h2 = [];
        _obj.time = parseInt(_obj.e);
        _browser.h2.push(_obj);

        VisitorManager.DUTVisitorBrowserURLs = Math.max(VisitorManager.DUTVisitorBrowserURLs,_obj.e);
        _browser.last_browse = lz_global_timestamp();
        _visitor.IsLoaded = true;
    }

    for(key in VisitorManager.Visitors)
    {
        for(bkey in VisitorManager.Visitors[key].b)
        {
            if(VisitorManager.Visitors[key].b[bkey].id == _obj.b)
            {
                var existingUrl = [];
                if(d(VisitorManager.Visitors[key].b[bkey].h2))
                    existingUrl = lzm_commonTools.GetElementByProperty(VisitorManager.Visitors[key].b[bkey].h2,'e',_obj.e);
                if(!existingUrl.length)
                    setData(VisitorManager.Visitors[key],VisitorManager.Visitors[key].b[bkey]);
                return;
            }
        }
        for(rkey in VisitorManager.Visitors[key].rv)
        {
            for(bkey in VisitorManager.Visitors[key].rv[rkey].b)
            {
                if(VisitorManager.Visitors[key].rv[rkey].b[bkey].id == _obj.b)
                {
                    setData(VisitorManager.Visitors[key],VisitorManager.Visitors[key].rv[rkey].b[bkey]);
                    return;
                }
            }
        }
    }

    if(!lzm_commonTools.GetElementByProperty(VisitorManager.QueuedURLS,'e',_obj.e).length)
    {
        VisitorManager.QueuedURLS.push(_obj);
    }
};

VisitorManager.AddBrowsersToVisitorFromQueue = function(_visitor){
    for(var key in VisitorManager.QueuedBrowsers)
    {
        if(VisitorManager.QueuedBrowsers[key].v == _visitor.id)
        {
            VisitorManager.AddBrowser(VisitorManager.QueuedBrowsers[key]);
            lzm_commonTools.RemoveFromArray(VisitorManager.QueuedBrowsers,VisitorManager.QueuedBrowsers[key]);
        }
    }


};

VisitorManager.AddURLSToBrowserFromQueue = function(_browser){
    for(var key in VisitorManager.QueuedURLS)
    {
        if(VisitorManager.QueuedURLS[key].b == _browser.id)
        {
            VisitorManager.AddURL(VisitorManager.QueuedURLS[key]);

            lzm_commonTools.RemoveFromArray(VisitorManager.QueuedURLS,VisitorManager.QueuedURLS[key]);
            VisitorManager.AddURLSToBrowserFromQueue(_browser);
            return;
        }
    }
};

VisitorManager.SetVisitorActive = function(_visitor){
    var isActive = false;
    if(_visitor != null)
    {
        for(var key in _visitor.b)
        {
            _visitor.b[key].is_active = _visitor.b[key].c==0;
            if(_visitor.b[key].is_active)
                isActive = true;
        }
        _visitor.is_active = isActive;

        if(!_visitor.is_active && parseInt(_visitor.e) > (lz_global_timestamp()-60) && !d(_visitor.b))
        {
            _visitor.is_active = true;
        }
    }
    return isActive;
};

VisitorManager.SetVisitorHidden = function(_visitor){

    if(!d(_visitor.IsHidden))
        _visitor.IsHidden=false;

    var old = _visitor.IsHidden;

    _visitor.IsHidden=false;
    if(DataEngine.getConfigValue('gl_vmac',false)!='1')
    {
        _visitor.IsHidden = true;
    }
    else if(!lzm_commonPermissions.checkUserMonitoringPermissions('','view',_visitor))
    {
        _visitor.IsHidden = true;
    }
    else if(LocalConfiguration.VisitorFilterHideInactive !== false && LocalConfiguration.VisitorFilterHideInactive > 0 && !VisitorManager.IsInChat(_visitor) && VisitorManager.GetLastActiveTime(_visitor) < (lz_global_timestamp()-(LocalConfiguration.VisitorFilterHideInactive*60)))
    {
        _visitor.IsHidden = true;
    }
    else if(DataEngine.getConfigValue('gl_hide_inactive',false)!='0' && !VisitorManager.IsInChat(_visitor) && VisitorManager.GetLastActiveTime(_visitor) < (lz_global_timestamp()-(parseInt(DataEngine.getConfigValue('gl_inti'))*60)))
    {
        _visitor.IsHidden = true;
    }

    if(!_visitor.IsHidden && DataEngine.getConfigValue('gl_doma',false)!='')
    {
        var domains = DataEngine.getConfigValue('gl_doma',false).replace(/ /g,'').split(',');
        var blacklist = DataEngine.getConfigValue('gl_bldo',false) == '1';
        var isOnDomain;

        _visitor.IsHidden = !blacklist;

        for(var key in domains)
        {
            isOnDomain = VisitorManager.IsOnDomain(_visitor,domains[key]);
            if(isOnDomain && blacklist)
            {
                _visitor.IsHidden = true;
                break;
            }
            else if (isOnDomain && !blacklist)
            {
                _visitor.IsHidden = false;
                break;
            }
        }
    }
    return old != _visitor.IsHidden;

};

VisitorManager.AddComment = function(_visitorId,_comObj){
    var visitorObj = VisitorManager.GetVisitor(_visitorId);
    if(!d(visitorObj.c))
        visitorObj.c = [];
    var exComment = lzm_commonTools.GetElementByProperty(visitorObj.c,'id',_comObj.id);
    if(!exComment.length)
        visitorObj.c.push(_comObj);
};

VisitorManager.AddInvite = function(_visitorId,_invObj){
    var visitorObj = VisitorManager.GetVisitor(_visitorId);
    if(!d(visitorObj.r))
        visitorObj.r = [];

    for(var key in visitorObj.r)
    {
        if(visitorObj.r[key].i == _invObj.i)
        {
            visitorObj.r[key] = _invObj;
            return;
        }
    }
    visitorObj.r.push(_invObj);
};

VisitorManager.GetVisitor = function(_id){
    if(d(_id))
    {
        if(_id.indexOf('~')!=-1)
            _id = _id.split('~')[0];

        var existing = lzm_commonTools.GetElementByProperty(VisitorManager.Visitors,'i',_id);
        if(existing.length)
            return existing[0];
    }
    return null;
};

VisitorManager.GetVisitorBrowser = function(_id,_visitorId,_searchRecent){

    var key;

    if(_id.indexOf('~')!=-1)
        _id = _id.split('~')[1];

    for(key in VisitorManager.Visitors)
    {
        if(d(_visitorId) && VisitorManager.Visitors[key].id != _visitorId)
            continue;
        var browsers = lzm_commonTools.GetElementByProperty(VisitorManager.Visitors[key].b,'id',_id);
        if(browsers.length)
            return browsers[0];
    }

    if(_searchRecent)
    {
        for(key in VisitorManager.Visitors)
        {
            if(d(_visitorId) && VisitorManager.Visitors[key].id != _visitorId)
                continue;

            if(d(VisitorManager.Visitors[key].rv))
                for(var rvkey in VisitorManager.Visitors[key].rv)
                {
                    if(d(VisitorManager.Visitors[key].rv[rvkey].b))
                        for(var rvbkey in VisitorManager.Visitors[key].rv[rvkey].b)
                        {
                            if(_id == VisitorManager.Visitors[key].rv[rvkey].b[rvbkey].id)
                            {
                                return VisitorManager.Visitors[key].rv[rvkey].b[rvbkey];
                            }
                        }
                }
        }
    }
    return null;
};

VisitorManager.GetLastActiveVisitorBrowser = function(_visitorId){

    if(_visitorId.indexOf('~')!=-1)
        _visitorId = _visitorId.split('~')[0];

    try
    {
        var visitor = lzm_commonTools.GetElementByProperty(VisitorManager.Visitors,'id',_visitorId);
        if(visitor.length && d(visitor[0].b))
        {
            var vlist = visitor[0].b;
            vlist = lzm_commonTools.SortByProperty(vlist,'last_browse',true);
            return vlist[0];
        }
    }
    catch(ex)
    {
        deblog(ex);
    }
    return null;
};

VisitorManager.GetVisitorName = function(_visitor,_maxlength,_raw){
    _raw = (d(_raw)) ? _raw : false;
    _maxlength = (d(_maxlength)) ? _maxlength : 1024;
    if(_visitor==null)
        return '';
    var name = _visitor.unique_name;
    var inputName = DataEngine.inputList.getInputValueFromVisitor(111,_visitor,_maxlength,_raw);
    if(inputName != '' && inputName != '-')
        name = inputName;
    if(!d(name))
        return '';
    return name;
};

VisitorManager.GetUniqueName = function(_idString) {
    var mod = 111;
    var digit;
    for (var i=0; i<_idString.length; i++) {
        digit = 0;
        if (!isNaN(parseInt(_idString.substr(i,1))))
        {
            digit = parseInt(_idString.substr(i,1));
            mod = (mod + (mod* (16+digit)) % 1000);
            if (mod % 10 == 0)
            {
                mod += 1;
            }
        }
    }
    return String(mod).substr(String(mod).length-4,4);
};

VisitorManager.Calculate = function(){
    VisitorManager.ActiveVisitors =
    VisitorManager.HiddenVisitors = 0;
    for(var k in VisitorManager.Visitors)
        if(!VisitorManager.Visitors[k].IsLoaded)
        {

        }
        else if(VisitorManager.Visitors[k].is_active && !VisitorManager.Visitors[k].IsHidden)
            VisitorManager.ActiveVisitors++;
        else if(VisitorManager.Visitors[k].is_active)
            VisitorManager.HiddenVisitors++;
    return VisitorManager.ActiveVisitors;
};

VisitorManager.GetLastActiveTime = function(_visitor){

    if(_visitor==null)
        return 0;

    if(!d(_visitor.b))
        return 0;

    var tmpBegin = 0;
    for (var i=0; i<_visitor.b.length; i++)
    {
        if (d(_visitor.b[i].h2) && _visitor.b[i].h2.length > 0)
        {
            var newestH = _visitor.b[i].h2.length - 1;
            tmpBegin = Math.max(_visitor.b[i].h2[newestH].time, tmpBegin);
            _visitor.last_active = tmpBegin;
        }
    }
    return _visitor.last_active;
};

VisitorManager.IsOnDomain = function(_visitorObj,_domainWildcard){

    if(_visitorObj==null)
        return false;
    if(!d(_visitorObj.b))
        return false;


    for(var bkey in _visitorObj.b)
    {
        for(var ukey in _visitorObj.b[bkey].h2)
        {
            if(_visitorObj.b[bkey].h2[ukey].url != '')
            {
                if(lzm_commonTools.IsWildcardMatch(_domainWildcard,_visitorObj.b[bkey].h2[ukey].url))
                    return true;
            }
        }
    }
    return false;
};

VisitorManager.GetPageTitle = function(_visitorObj){
    var pageTitle = '';
    try
    {
        var browser = VisitorManager.GetLastActiveVisitorBrowser(_visitorObj.id);
        if(browser != null && d(browser.h2))
            pageTitle = browser.h2[browser.h2.length-1].title;
    }
    catch(ex)
    {
        deblog(ex);
    }
    return pageTitle;
};

VisitorManager.GetPageCount = function(_visitorObj){

    var pageCount = 0;
    try
    {
        if(d(_visitorObj.b))
            for (var i=0; i<_visitorObj.b.length; i++)
            {
                if(d(_visitorObj.b[i].h2))
                    pageCount += _visitorObj.b[i].h2.length;
            }
    }
    catch(ex)
    {
        deblog(ex);
    }
    return pageCount;
};

VisitorManager.GetReferrer = function(_visitorObj){
    var refUrl = '';
    for(var bkey in _visitorObj.b)
    {
        if(d(_visitorObj.b[bkey].h2))
            if(_visitorObj.b[bkey].h2[0].ref != null && _visitorObj.b[bkey].h2[0].ref.u != '')
            {
                refUrl = _visitorObj.b[bkey].h2[0].ref.u;
                break;
            }
    }
    if(refUrl.indexOf('http') == 0)
        refUrl = '<a href="#" class="lz_chat_link_no_icon" data-role="none" onclick="openLink(\'http://dereferrer.livezilla.info/?url=' + refUrl + '\');">' + refUrl + '</a>';
    return refUrl;
};

VisitorManager.PruneVisitors = function(){
    for(var key in VisitorManager.Visitors)
    {
        var visitor = VisitorManager.Visitors[key];
        VisitorManager.SetVisitorActive(visitor);
        if(!visitor.is_active && d(visitor.b) && visitor.b.length)
        {
            if(visitor.WasInChat || visitor.IsInChat)
                continue;

            if(visitor.is_drawn || visitor.is_mapped)
                continue;

            VisitorManager.Visitors.splice(key,1);
        }
    }
};

VisitorManager.GetUns = function(){
    for(var key in VisitorManager.Visitors)
    {
        if(!VisitorManager.Visitors[key].IsLoaded)
            console.logit(VisitorManager.Visitors[key]);
    }
};

VisitorManager.GetLatestInvite = function(_visitorObj){
    var invList = lzm_commonTools.clone(_visitorObj.r);
    invList = lzm_commonTools.SortByProperty(invList,'c',true);
    return invList[0];
};

VisitorManager.GetWebsiteNames = function(_visitorObj){
    var names = '';
    if(_visitorObj != null && d(_visitorObj.b))
        for(var bkey in _visitorObj.b)
        {
            for(var ukey in _visitorObj.b[bkey].h2)
            {
                if(_visitorObj.b[bkey].h2[ukey].code != '')
                {
                    if(names.indexOf(_visitorObj.b[bkey].h2[ukey].code)==-1)
                        names += ((names.length) ? ', ' : '') + _visitorObj.b[bkey].h2[ukey].code;
                }
            }
        }
    return names;
};

VisitorManager.IsInChatWith = function(_visitorObj,_operatorId){

    for(var key in DataEngine.ChatManager.Chats)
    {
        var cc = DataEngine.ChatManager.Chats[key];
        if(cc.GetStatus() != Chat.Closed && cc.IsMember(_operatorId))
        {
            if(cc.Visitor != null && cc.Visitor.id == _visitorObj.id)
                return true;
        }
    }
    return false;
};

VisitorManager.IsInChat = function(_visitorObj){
    if(_visitorObj != null)
        for(var key in DataEngine.ChatManager.Chats)
        {
            var cc = DataEngine.ChatManager.Chats[key];
            if(cc.GetStatus() != Chat.Closed)
            {
                if(cc.Visitor != null && cc.Visitor.id == _visitorObj.id)
                    return true;
            }
        }
    return false;
};

function NotificationManager(){

}

NotificationManager.NotifyVisitor = function (_visitor){
    if(LocalConfiguration.NotificationVisitors && !IFManager.IsMobileOS && CommunicationEngine.pollCounter > 1)
    {
        var nameRaw = VisitorManager.GetVisitorName(_visitor,56,true);
        var name = VisitorManager.GetVisitorName(_visitor,56,false);

        if(_visitor != null && !name.length && !nameRaw.length && _visitor.ctryi2.length)
        {
            name = nameRaw = lzm_chatDisplay.getCountryName(_visitor.ctryi2,false);
            name += '<br>' + _visitor.city;
        }

        if(IFManager.IsDesktopApp())
            IFManager.IFShowNotification(tid('new_visitor'), name, 'NONE', '', '', '6');
        else
            if (lzm_chatDisplay.selected_view != 'external' || $('.dialog-window-container').length > 0)
            {
                lzm_displayHelper.showBrowserNotification({
                text: '',
                sender: nameRaw,
                subject: tid('new_visitor'),
                action: 'SelectView(\'external\'); closeOrMinimizeDialog();',
                timeout: 10,
                icon: 'fa-user'
            });
        }
    }

    if(LocalConfiguration.PlayVisitorSound && !IFManager.IsMobileOS && CommunicationEngine.pollCounter > 1)
        lzm_chatDisplay.playSound('visitor', _visitor.id, '');
 };

NotificationManager.NotifyChat = function(chat, new_chat) {

    var senderId='',sender = new_chat.sen;
    var receivingChat = new_chat.rec;
    var text = new_chat.textOriginal;

    receivingChat = (typeof receivingChat != 'undefined' && receivingChat != '') ? receivingChat : sender;
    text = (typeof text != 'undefined') ? text : '';


    if (LocalConfiguration.PlayChatMessageSound/* && (chat!=null || sender.indexOf('~') == -1 || !LoadModuleConfiguration.PlayChatSound)*/)
        lzm_chatDisplay.playSound('message', sender, text);


    var notificationSound = (!LocalConfiguration.PlayChatMessageSound) ? 'DEFAULT' : 'NONE';

    var senderName = '??', senderNameRaw = '??';
    if (chat.Type == Chat.Visitor && sender == chat.SystemId)
    {
        senderNameRaw = chat.GetName(56,true);
        senderName = chat.GetName(56,false);
    }
    else if(new_chat.sen.indexOf('~')!=-1)
    {
        chat = DataEngine.ChatManager.GetChat(new_chat.sen,'SystemId');
        if(chat != null)
        {
            senderNameRaw = chat.GetName(56,true);
            senderName = chat.GetName(56,false);
        }
    }
    else
    {
        senderId = sender;
        var operator = DataEngine.operators.getOperator(senderId);
        senderNameRaw = senderName = (operator != null) ? operator.name : senderName;

    }

    text = text.replace(/<.*?>/g,'').replace(/<\/.*?>/g,'');

    var notificationPush = tid('notification_new_message',[['<!--sender-->',senderName],['<!--text-->',text]]).substr(0, 250);
    if(IFManager.IsDesktopApp() && LocalConfiguration.NotificationChats)
        IFManager.IFShowNotification(senderName, text, notificationSound, sender, receivingChat, "1");
    else if(!IFManager.IsDesktopApp())
        IFManager.IFShowNotification(senderNameRaw, notificationPush, notificationSound, sender, receivingChat, "1");

    if(!IFManager.IsDesktopApp())
        if (lzm_chatDisplay.selected_view != 'mychats' || $('.dialog-window-container').length > 0)
        {
            if(LocalConfiguration.NotificationChats)
            {
                lzm_displayHelper.showBrowserNotification({
                    text: text,
                    sender: senderNameRaw,
                    subject: t('New Chat Message'),
                    action: 'openChatFromNotification(\'' + receivingChat + '\'); closeOrMinimizeDialog();',
                    timeout: 10,
                    icon: 'fa-commenting'
                });
            }
        }
};