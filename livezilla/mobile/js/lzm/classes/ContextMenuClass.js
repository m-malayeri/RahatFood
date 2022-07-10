

function ContextMenuClass() {}

ContextMenuClass.CurrentMenu = [];
ContextMenuClass.SubmenuIndent = 20;
ContextMenuClass.MinWidth = 170;
ContextMenuClass.SampleMenu = {
    id: 'sample_menu',
    onClickName: 'console.log', // Value of the entry will be function parameter
    entries: [{
            label: 'first entry',
            checked: true,
            value: 'first_entry'
        },
        '', {
            label: 'Second Entry',
            checked: false,
            onClick: 'console.log("hello")'
        }, {
            label: 'Submenu Entry',
            checked: true, // this won't apply because it is an submenu
            onClick: "console.log('test')", // this won't apply because submenu must be opened if exist
            submenu: {
                isSubmenu: true, // important for the context menu to build as submenu
                onClickName: 'ContextMenuClass.SampleFunction', // function to be called by all entries
                entries: [{
                    label: 'Another Submenu with a very long name',
                    submenu: {
                        isSubmenu: true,
                        onClickName: 'defaultFunction2',
                        entries: [{
                            label: 'Eintrag 1'
                        }, {
                            label: 'Eintrag 2'
                        }, {
                            label: '4th level of submenues',
                            submenu: {
                                onClickName: 'ContextMenuClass.SampleFunction',
                                isSubmenu: true,
                                entries: [{
                                        label: 'checkbox1',
                                        checked: true
                                    },
                                    '', {
                                        label: 'checkbox2',
                                        checked: false
                                    }
                                ]
                            }
                        } ]
                    }
                }, {
                    label: 'entry1'
                }, {
                    label: 'entry2'
                } ]
            }
        }
    ]
};

ContextMenuClass.SampleFunction = function(_input) {
    // console.log('Sample function was triggered with input: ' + _input);
};

ContextMenuClass.RemoveAll = function() {

    while (ContextMenuClass.CurrentMenu.length > 0) {
        ContextMenuClass.Pop();
    }
};

ContextMenuClass.CalculateMenuPosition = function(event, _isSubmenu) {
    var top = 0;
    var left = 0;
    if (_isSubmenu) {
        var id = ((event.target.id === '') ? event.target.parentNode.id : event.target.id);
        var pos = $('#' + id).position();
        top = pos.top;
        left = pos.left + ContextMenuClass.SubmenuIndent;
    } else {
        top = event.clientY;
        left = event.clientX;
    }

    var win = event.target.ownerDocument.defaultView;
    var frame = win.frameElement;
    if (frame && frame.id !== 'appFrame') {
        var parent = frame.parentNode;
        var offset = $(parent).offset();
        // console.log(offset);
        top = top + offset.top;
        left = left + offset.left;
    }

    return {
        top: top,
        left: left
    };
};

ContextMenuClass.CalculateMenuId = function() {
    var lastMenuIndex = ContextMenuClass.Depth();
    var lastItem = ContextMenuClass.CurrentMenu[lastMenuIndex];
    return 'sub-' + lastItem.id;
};

ContextMenuClass.Depth = function() {
    return ContextMenuClass.CurrentMenu.length - 1;
};

ContextMenuClass.Last = function() {
    return ContextMenuClass.CurrentMenu[ContextMenuClass.Depth()];
};

ContextMenuClass.First = function() {
    return ContextMenuClass.CurrentMenu[0];
};

ContextMenuClass.Parent = function() {
    return ContextMenuClass.CurrentMenu[ContextMenuClass.CurrentMenu.length - 2];
};

ContextMenuClass.AddMouseOut = function(_id) {
    $('#' + _id).mouseout(function(event) {
        var toElem = $(event.toElement);
        var toElemId = toElem.attr('id');
        var lastMenuIndex = ContextMenuClass.Depth();
        for (var i = lastMenuIndex; i > 0; i--) {
            var itemID = ContextMenuClass.CurrentMenu[i].id;
            var isChild = (toElem.closest('#' + itemID).length > 0);
            if (isChild) {
                // console.log(toElemId + ' is child of ' + itemID);
                break;
            } else {
                // console.log(toElemId + ' is not child of ' + itemID);
                ContextMenuClass.Pop();
            }
        }
    });
    $('#' + _id).parent().off('mouseout');
};

ContextMenuClass.ToggleMenu = function(event, _menu) {
    if ($('#' + _menu.id).length) {
        ContextMenuClass.RemoveAll();
    } else {
        ContextMenuClass.BuildMenu(event, _menu);
    }
};

ContextMenuClass.BuildMenu = function(event, _menu) {
    if (_menu === null) {
        // console.log('catch this');
        return;
    }
    if (typeof(_menu) === 'undefined') {
        // console.log('use sample');
        _menu = ContextMenuClass.SampleMenu;
    }
    var menuId = _menu.id || ContextMenuClass.CalculateMenuId();
    if ($('#' + menuId).length) {
        ContextMenuClass.Pop();
    } else {
        _menu.id = menuId;
        ContextMenuClass.Push(_menu);
        var position = ContextMenuClass.CalculateMenuPosition(event, _menu.isSubmenu);
        // console.log(position);
        // add menu to body
        var wrapperDiv = $('<div></div>', {
            id: menuId,
            class: 'cm lzm-unselectable',
            style: 'z-index:1003;top:' + position.top + 'px;left: ' + position.left + 'px;'
        });
        if (_menu.isSubmenu) {
            var parentMenuId = ContextMenuClass.Parent().id;
            var targetEntryId = event.target.id || event.target.parentNode.id;
            $(wrapperDiv).attr('class', 'cm lzm-unselectable contextmenuclass-submenu').css({
                'min-width': ($('#' + ContextMenuClass.First().id).width() - ContextMenuClass.SubmenuIndent) + 'px'
            }).appendTo($('#' + parentMenuId));
            $('#' + targetEntryId).attr('onClick', 'ContextMenuClass.ReBuildSubMenu(event,null);event.stopPropagation()');

            ContextMenuClass.AddMouseOut(menuId);

            var parentMenu = ContextMenuClass.Parent();
            if (parentMenu.isSubmenu) {
                var parentElem = $('#' + parentMenu.id);
                var currentLeft = parentElem.position().left;
                parentElem.animate({
                    'min-width': '170px',
                    'left': currentLeft - ContextMenuClass.SubmenuIndent
                });
            }
        } else {
            $(wrapperDiv).appendTo($('body'));
        }

        // add entries to menu

        for (var i = 0; i < _menu.entries.length; i++) {
            // check ruler
            if (_menu.entries[i] === '') {
                $('<hr>').appendTo($(wrapperDiv));
            } else {
                // add click event
                var outer = $('<div></div>', {
                    id: menuId + '-entry' + i
                }).appendTo($(wrapperDiv));
                var onClick;
                if (_menu.entries[i].submenu) {
                    // MAKE snd click should close the submenu
                    onClick = 'ContextMenuClass.BuildMenu(event,ContextMenuClass.Last().entries[' + i + '].submenu);event.stopPropagation()';
                } else if (_menu.entries[i].onClick) {
                    onClick = _menu.entries[i].onClick + ';ContextMenuClass.RemoveAll();event.stopPropagation()';
                } else {
                    var value = _menu.entries[i].value || _menu.entries[i].label;
                    onClick = _menu.onClickName + '("' + value + '");ContextMenuClass.RemoveAll();event.stopPropagation()';
                }
                $(outer.attr('onClick', onClick));
                // add checkbox
                if (typeof(_menu.entries[i].checked) === 'boolean' && typeof(_menu.entries[i].submenu) === 'undefined') {
                    $(outer.attr('class', 'contextmenuclass-entry-checkbox'));
                    var isChecked = _menu.entries[i].checked;
                    $('<input>', {
                        type: 'checkbox',
                        class: 'checkbox-custom contextmenuclass-checkbox',
                        id: menuId + '-checkbox' + i,
                        checked: (isChecked ? 'checked' : false)
                    }).appendTo($(outer));
                    // add label
                    $('<label>', {
                        class: 'contextmenuclass-label checkbox-custom-label',
                        for: menuId + '-checkbox'
                        //onClick: 'event.stopPropagation()'
                    }).text(_menu.entries[i].label).appendTo($(outer));
                } else if (_menu.entries[i].submenu) {
                    // MAKE add icon to submenuentries @context
                    $('<span></span>', {
                        class: 'fa fa-caret-down contextmenuclass-submenu-icon'
                    }).appendTo($(outer));
                } else {
                    $('<span></span>').text(_menu.entries[i].label).appendTo($(outer));
                }

            }
        }

        // recalculate menu height
        var lastMenuIndex = ContextMenuClass.Depth();
        for (var j = lastMenuIndex; j >= 0; j--) {
            var menu = ContextMenuClass.CurrentMenu[j];
            var menuElem = $('#' + menu.id);
            var scrollHeight = menuElem[0].scrollHeight;
            var newHeight = scrollHeight + 'px';
            menuElem.css({
                'height': newHeight
            });
            menuElem.css({
                'z-index': 1003 + i
            });
        }

        // recalculate position
        var mainMenu = ContextMenuClass.CurrentMenu[0];
        var mainMenuElem = $('#' + mainMenu.id);
        var mainMenuPos = mainMenuElem.position();
        if (($('body').height() - mainMenuPos.top) < mainMenuElem.outerHeight()) {
            // MAKE move all parent menus, too @context
            mainMenuElem.animate({
                'top': ($('body').height() - mainMenuElem.outerHeight() - 5)
            }, {
                duration: 'fast',
                queue: false
            });
        }
        if (($('body').width() - mainMenuPos.left) < mainMenuElem.outerWidth()) {
            // MAKE move all parent menus, too @context
            mainMenuElem.animate({
                'left': ($('body').width() - mainMenuElem.outerWidth() - 5)
            }, {
                duration: 'fast',
                queue: false
            });
        }

    }
};

ContextMenuClass.ReBuildSubMenu = function(event, _menu) {
    // console.log('what next');
    // console.log(event);
    var targetEntryId = event.target.id || event.target.parentNode.id;
    // console.log(targetEntryId);
    var menuID = $('#' + targetEntryId).parent().attr('id');
    // console.log('search for menu ' + menuID);
    var parentMenu = ContextMenuClass.GetMenuById(menuID);
    if ($('#sub-' + menuID).length) {
        ContextMenuClass.Pop();
    } else {
        // console.log('parentMenu:');
        // console.log(parentMenu);
        var subMenu = ContextMenuClass.GetSubMenuByEntryId(parentMenu, targetEntryId);
        // console.log('subMenu:');
        // console.log(subMenu);
        if (subMenu) {
            ContextMenuClass.BuildMenu(event, subMenu);
        }
    }
};

ContextMenuClass.GetSubMenuByEntryId = function(_menu, _entryId) {
    var childCount = _entryId.substr(-1);
    // console.log('childCount: ' + childCount );
    // console.log(_menu.entries);
    // var entryArray = _menu.entries.filter(function(elem) {
    //     return elem !== '';
    // });
    // console.log(entryArray);
    return _menu.entries[childCount].submenu;
    // for(var i = 0; i < _menu.entries.length -1; i++){
    //     if(_menu.entries[i].submenu){
    //
    //     }
    // }
};

ContextMenuClass.GetMenuById = function(_id) {
    for (var i = 0; i < ContextMenuClass.CurrentMenu.length; i++) {
        if (ContextMenuClass.CurrentMenu[i].id === _id) {
            return ContextMenuClass.CurrentMenu[i];
        }
    }
};

ContextMenuClass.AddContextMenuListenerToElement = function(_element, _menuObjectBuilderName, _eventName) {
    _element.addEventListener(_eventName || 'contextmenu', function(event) {
        ContextMenuClass.BuildMenu(event, _menuObjectBuilderName(event));
    });
};

ContextMenuClass.Push = function(_menu) {
    // console.log('push ' + _menu.id);
    ContextMenuClass.CurrentMenu.push(_menu);
};

ContextMenuClass.Pop = function() {
    var menuToBeRemoved = ContextMenuClass.CurrentMenu.pop();
    // console.log('pop ' + menuToBeRemoved.id);
    $('#' + menuToBeRemoved.id).remove();
    if (menuToBeRemoved.isSubmenu) {
        var lastMenu = ContextMenuClass.Last();
        var lastMenuId = lastMenu.id;
        var entryCount = $('#' + lastMenuId).children('div').length;
        // console.log('entryCount: ' + entryCount);
        $('#' + lastMenuId).animate({
            height: entryCount * 25 + 'px'
        }, {
            duration: 'fast',
            queue: false
        });
        var lastElem = $('#' + lastMenu.id);
        var currentLeft = lastElem.position().left;
        if (ContextMenuClass.Last().isSubmenu) {
            lastElem.animate({
                'min-width': (ContextMenuClass.MinWidth - ContextMenuClass.SubmenuIndent) + 'px',
                'left': currentLeft + ContextMenuClass.SubmenuIndent
            }, {
                duration: 'fast',
                queue: false
            });
            ContextMenuClass.AddMouseOut(lastMenuId);
        }

    }

};
