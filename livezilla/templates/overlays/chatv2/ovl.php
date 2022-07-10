<?php
/****************************************************************************************
 * LiveZilla ovl.php
 *
 * Copyright 2017 LiveZilla GmbH
 * All rights reserved.
 * LiveZilla is a registered trademark.
 *
 * Improper changes to this file may cause critical errors.
 ***************************************************************************************/

if(!defined("LIVEZILLA_PATH"))
    define("LIVEZILLA_PATH","./");

@ini_set('session.use_cookies', '0');
@error_reporting(E_ALL);

require_once(LIVEZILLA_PATH . "_lib/functions.external.inc.php");
require_once(LIVEZILLA_PATH . "_lib/objects.external.inc.php");

@set_time_limit(Server::$Configuration->File["timeout_chats"]);
if(!isset($_GET["file"]))
    @set_error_handler("handleError");
if(!isset($_GET[GET_TRACK_BROWSERID]))
    exit();

LocalizationManager::AutoLoad();
Server::InitDataBlock(array("INTERNAL","GROUPS","FILTERS","INPUTS"));
Server::$Operators[SYSTEM] = Operator::GetSystemOperator();

$OVERLAY = new OverlayChat();
$OVERLAY->Version = 2;
$USER = VisitorMonitoring::$Visitor;
$USER->Browsers[0] = new VisitorChat($USER->UserId,$USER->UserId . "_OVL");
$USER->Browsers[1] = VisitorMonitoring::$Browser;

$OVERLAY->GroupBuilder = new GroupBuilder($USER->Browsers[0]->DesiredChatGroup,$USER->Browsers[0]->DesiredChatPartner,false);
$OVERLAY->GroupBuilder->Generate(null,true);

$USER->Browsers[0]->Overlay = true;
$USER->Browsers[0]->Load();

if($USER->Browsers[0]->FirstCall)
    $USER->AddFunctionCall("lz_chat_init_data_change(null);",false);

$OVERLAY->KnowledgebaseSearch();

if(IS_FILTERED && !FILTER_ALLOW_CHATS)
{
    $USER->Browsers[0]->CloseChat();
    $USER->Browsers[0]->Destroy();

    if(!FILTER_ALLOW_TICKETS)
        $USER->AddFunctionCall("lz_tracking_remove_overlay_chat();",true);
}

$OVERLAY->DefineTargets();
$OVERLAY->DefineModes();

if(defined("IGNORE_WM") && (empty($USER->Browsers[0]->DesiredChatGroup) || !$OVERLAY->Human))
    $USER->AddFunctionCall("lz_chat_set_talk_to_human(false,false);",false);

$OVERLAY->IsHumanChatAvailable = $OVERLAY->OperatorCount > 0;
$OVERLAY->CreateChatTemplate();
$OVERLAY->RemoveTicketFile();
$OVERLAY->ProcessTicket($USER);

if(isset($_GET["ri"]))
    $USER->Browsers[0]->ReplaceLoginDetails($USER,false,true);
if(($USER->Browsers[0]->Status > CHAT_STATUS_OPEN || !empty($USER->Browsers[0]->InitChatWith) || $USER->Browsers[0]->Waiting) && !$USER->Browsers[0]->Closed)
    Visitor::$IsActiveOverlayChat = $OVERLAY->IsHumanChatAvailable = !$USER->Browsers[0]->Declined;
else if($USER->Browsers[0]->Closed && $USER->Browsers[0]->LastActive > (time()-Server::$Configuration->File["timeout_chats"]) || !empty($_GET["mi0"]))
    Visitor::$IsActiveOverlayChat = !$USER->Browsers[0]->Declined;

if(!empty($USER->Browsers[0]->DesiredChatGroup) && !(IS_FILTERED && !FILTER_ALLOW_CHATS && !FILTER_ALLOW_TICKETS))
{
    $group = Server::$Groups[$USER->Browsers[0]->DesiredChatGroup];
    $changed = (Visitor::$PollCount!=1) ? $USER->ApplyOverlayInputValues($group) : false;

    if(empty($USER->Browsers[0]->Subject) && !empty($_GET["mp0"]))
        $USER->Browsers[0]->Subject = Str::Cut(Encoding::Base64UrlDecode($_GET["mp0"]),600);

    if(Communication::ReadParameter("tc",-1) != -1)
        $changed = true;

    if(($USER->Browsers[0]->Status > CHAT_STATUS_OPEN||$USER->Browsers[0]->Waiting) && isset($_GET["di"]) && $USER->VisitorData->Id != $_GET["di"])
    {
        $USER = $USER->Browsers[0]->ReplaceLoginDetails($USER,true,true);
        $USER->AddFunctionCall("lz_chat_load_input_values(true);lz_chat_update_name();",false);
        $USER->VisitorData->SaveToCookie();
    }

    if($changed)
    {
        $USER->ApplyVisitorData();
        if(!$USER->Browsers[0]->Closed)
            $USER->Browsers[0]->UpdateArchive((Communication::ReadParameter("tc",-1) == 1) ? $USER->VisitorData->Email : "");
    }

    if(Visitor::$PollCount == 1)
    {
        $ovlw = Communication::ReadParameter("ovlw",380);
        $ovlh = Communication::ReadParameter("ovlh",DataInput::GetMaxHeight());

        $text = ($OVERLAY->IsHumanChatAvailable) ? Communication::GetParameter("ovlt",LocalizationManager::$TranslationStrings["client_overlay_title_online"],$c,FILTER_HTML_ENTITIES) : Communication::GetParameter("ovlto",LocalizationManager::$TranslationStrings["client_overlay_title_offline"],$c,FILTER_HTML_ENTITIES);

        $ml = 0;
        $mt = 0;

        $mr = Communication::GetParameter("ovlmr",30,$nu,FILTER_SANITIZE_NUMBER_INT);
        $mb = Communication::GetParameter("ovlmb",30,$nu,FILTER_SANITIZE_NUMBER_INT);

        $wmHTML = OverlayChat::ReplaceColors(IOStruct::GetFile(TEMPLATE_SCRIPT_OVERLAY_CHAT."wm.tpl"),false);

        VisitorMonitoring::$Response .= "lz_tracking_add_overlay_chat_v2('".base64_encode($OVERLAY->ChatHTML)."','".base64_encode(Server::$Configuration->File["gl_site_name"])."',".$ovlw.",".$ovlh.",".$ml.",".$mt.",".$mr.",".$mb.",'".Communication::ReadParameter("ovlp",22)."',true,".To::BoolString($OVERLAY->IsHumanChatAvailable).");";
        VisitorMonitoring::$Response .= "lz_tracking_add_welcome_manager('".base64_encode($wmHTML)."',".$ml.",".$mt.",".$mr.",".$mb.");";

        $eca = Communication::GetParameter("eca",0,$nu,FILTER_VALIDATE_INT);
        $ecb = Communication::ReadParameter("ecslw",2);
        $ecp = false;

        if(!empty($_GET["eca"]) && !(!empty($_GET["echm"]) && VisitorMonitoring::$IsMobile && !VisitorMonitoring::$IsTablet))
        {
            $ecw = Communication::ReadParameter("ecw",$ovlw);
            $ech = Communication::ReadParameter("ech",100);
            $catcher = IOStruct::GetFile(TEMPLATE_SCRIPT_OVERLAY_CHAT."eyecatcher_image.tpl");
            VisitorMonitoring::$Response .= "lz_tracking_add_eye_catcher_v2('".base64_encode($catcher)."',".$ecw.",".$ech.",".Communication::GetParameter("ecfi",0,$nu,FILTER_VALIDATE_INT).",".Communication::ReadParameter("ecfo",0).",".Communication::GetParameter("ecmr",0).",".Communication::ReadParameter("ecmb",0).");";
        }
        /*
        else if(false)
        {
            $catcher = $OVERLAY->GetEyeCatcherTemplate();
            VisitorMonitoring::$Response .= "xtest('".base64_encode($catcher)."');";
        }
        */
    }
    if(Communication::ReadParameter("clch","")=="1")
    {
        $USER->Browsers[0]->ExternalClose();
        $USER->Browsers[0]->Destroy();
        $USER->AddFunctionCall("lz_leave_chat=false;lz_closed=false;lz_tracking_poll_server();",false);
    }

    $setGroup = Visitor::$IsActiveOverlayChat;
    $showWidgets = true;
    if(isset($_GET["ovlio"]) && !($OVERLAY->IsHumanChatAvailable && !empty($USER->Browsers[1]->ChatRequest)))
        $showWidgets = false;
    else if(isset($_GET["ovloo"]) && !$OVERLAY->IsHumanChatAvailable)
        $showWidgets = false;

    $declined = false;
    $OVERLAY->LastPostReceived = "null";
    $OVERLAY->LastMessageReceived = "null";
    $OVERLAY->IsChatAvailable = $OVERLAY->Botmode;
    $OVERLAY->FullLoad = (!empty($_GET["full"]));
    $OVERLAY->Flags["LPR"] = Communication::ReadParameter("lpr","");
    $OVERLAY->Flags["LMR"] = Communication::ReadParameter("lmr","");
    $OVERLAY->LastPoster = Communication::ReadParameter("lp","");

    if($USER->Browsers[0]->Declined)
    {
        //$OVERLAY->IsChatAvailable = false;
        $OVERLAY->IsChatAvailable = true;
    }
    else if($USER->Browsers[0]->Status > CHAT_STATUS_OPEN && !$USER->Browsers[0]->Closed)
    {
        $OVERLAY->IsChatAvailable = true;
        if(!empty($USER->Browsers[0]->OperatorId) && Server::$Operators[$USER->Browsers[0]->OperatorId]->IsBot)
            if(($OVERLAY->OperatorCount > 0 && !$OVERLAY->Botmode) && !$USER->Browsers[0]->ExternalClosed)
            {
                foreach($USER->Browsers[0]->Members as $sid => $member)
                    if(!Server::$Operators[$sid]->IsBot)
                        $USER->Browsers[0]->LeaveChat($sid);

                $USER->Browsers[0]->ExternalClose();
                $USER->Browsers[0]->Closed = true;
            }
        if($USER->Browsers[0]->Activated == CHAT_STATUS_ACTIVE && $USER->Browsers[0]->Status != CHAT_STATUS_ACTIVE)
            $USER->Browsers[0]->SetStatus(CHAT_STATUS_ACTIVE);

        $action = $USER->Browsers[0]->GetMaxWaitingTimeAction(false);
        if($action == "MESSAGE" || ($action == "FORWARD" && !$USER->Browsers[0]->CreateAutoForward($USER)))
            $declined = true;
    }
    else
        $OVERLAY->IsChatAvailable = $OVERLAY->OperatorCount > 0;

    if(!$OVERLAY->IsChatAvailable)
        $OVERLAY->SetHost(null);

    $OVERLAY->ProcessPosts();
    $OVERLAY->Listen();

    if($declined || $USER->Browsers[0]->Declined)
    {
        $USER->AddFunctionCall("lz_chat_set_talk_to_human(false,false);",false);
        $OVERLAY->AddHTML(str_replace("<!--message-->",$OVERLAY->GetDeclinedMessage(),IOStruct::GetFile(TEMPLATE_HTML_MESSAGE_OVERLAY_CHAT_STATUS)),"sys","");
        $USER->Browsers[0]->ExternalClose();
    }


    if(empty($USER->Browsers[0]->GroupChat) && $OVERLAY->IsChatAvailable && ((!(!empty($USER->Browsers[1]->ChatRequest) && !$USER->Browsers[1]->ChatRequest->Closed) && empty($USER->Browsers[0]->OperatorId) && !$USER->Browsers[0]->Waiting) || (!empty($USER->Browsers[0]->OperatorId) && Server::$Operators[$USER->Browsers[0]->OperatorId]->IsBot && $OVERLAY->Flags["LMR"]=="ONM01") || $OVERLAY->FullLoad))
    {
        if(($OVERLAY->Flags["LMR"]!="ONM01" || $OVERLAY->FullLoad) && (!$OVERLAY->Botmode || (!empty($USER->Browsers[0]->OperatorId) && !Server::$Operators[$USER->Browsers[0]->OperatorId]->IsBot) || (!empty($USER->Browsers[1]->ChatRequest) && !$USER->Browsers[1]->ChatRequest->Closed)))
        {
            if(!$OVERLAY->Botmode && (!empty($USER->Browsers[0]->ChatId) && !$USER->Browsers[0]->InternalActivation && !$USER->Browsers[0]->Closed && !$USER->Browsers[0]->Declined && !$USER->Browsers[0]->Waiting) && !isset($_GET["pgc"]))
                $OVERLAY->AddHTML(str_replace("<!--message-->",LocalizationManager::$TranslationStrings["client_int_is_connected"],IOStruct::GetFile(TEMPLATE_HTML_MESSAGE_OVERLAY_CHAT_STATUS)),"sys","ONM01");
            else if($USER->Browsers[0]->Status == CHAT_STATUS_OPEN && !$USER->Browsers[0]->Waiting && !isset($_GET["pgc"]))
                $OVERLAY->AddHTML(str_replace("<!--message-->",LocalizationManager::$TranslationStrings["client_chat_available"],IOStruct::GetFile(TEMPLATE_HTML_MESSAGE_OVERLAY_CHAT_STATUS)),"sys","ONM01");
            else if(isset($_GET["pgc"]))
            {
                $OVERLAY->AddHTML(str_replace("<!--message-->",LocalizationManager::$TranslationStrings["client_joined_chat"],IOStruct::GetFile(TEMPLATE_HTML_MESSAGE_OVERLAY_CHAT_STATUS)),"sys","ONM01");

            }
        }
        else if($OVERLAY->Botmode && (($OVERLAY->Flags["LMR"]!="OBM01" || $OVERLAY->FullLoad) && ( (empty($USER->Browsers[0]->OperatorId) && empty($OVERLAY->CurrentOperatorId)) || (!empty($USER->Browsers[0]->OperatorId) && Server::$Operators[$USER->Browsers[0]->OperatorId]->IsBot))))
        {
            $USER->Browsers[0]->FindOperator(VisitorChat::$Router,$USER,true,true);
            if(!empty(Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]) && Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]->IsBot)
            {
                $text = @LocalizationManager::$TranslationStrings["client_now_speaking_to_va"];
                if(!empty($USER->Browsers[0]->GroupChat))
                    $text = "";
                else if(!$OVERLAY->Human)
                    $text = @LocalizationManager::$TranslationStrings["client_now_speaking_to_va_offline"];

                $USER->AddFunctionCall("lz_chat_input_bot_state(true,false);",false);

                if(!empty($text))
                    $OVERLAY->AddHTML($OVERLAY->GetPostHTML(str_replace("<!--operator_name-->", Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]->Fullname, $text), "", true, Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]->Fullname, time(), $USER->Browsers[0]->DesiredChatPartner, Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]->IsBot,false),"sys","OBM01");

                $OVERLAY->SetHost($USER->Browsers[0]->DesiredChatPartner);
            }
        }
    }

    $OVERLAY->SetMembers();

    if(!$OVERLAY->Botmode && empty($_GET["tth"]) && ($USER->Browsers[0]->Status > CHAT_STATUS_OPEN || isset($_GET["mi0"])))
        $USER->AddFunctionCall("lz_chat_set_talk_to_human(true,true);",false);

    $OVERLAY->BotTitle = ($OVERLAY->Botmode && !empty(Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]) && Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]->IsBot) ? base64_encode(str_replace(array("%name%","%operator_name%"),Server::$Operators[$USER->Browsers[0]->DesiredChatPartner]->Fullname,LocalizationManager::$TranslationStrings["client_bot_overlay_title"])) : "";
    if($OVERLAY->IsChatAvailable && !Visitor::$OpenChatExternal && !empty($USER->Browsers[1]->ChatRequest) && Server::$Operators[$USER->Browsers[1]->ChatRequest->SenderSystemId]->IsExternal(Server::$Groups,null,null))
    {
        if(!isset($_GET["hinv"]) && !$USER->Browsers[1]->ChatRequest->Closed && !$USER->Browsers[1]->ChatRequest->Accepted)
        {
            $sound = (!empty(Server::$Configuration->File["gl_cips"]) && !$USER->Browsers[1]->ChatRequest->Displayed);
            if($OVERLAY->FullLoad)
                $USER->Browsers[1]->ChatRequest->Displayed = false;

            if(!$USER->Browsers[1]->ChatRequest->Displayed)
            {
                $USER->Browsers[1]->ChatRequest->Load();
                $OVERLAY->AddHTML($OVERLAY->GetInviteHTML($USER->Browsers[1]->ChatRequest->SenderSystemId,$USER->Browsers[1]->ChatRequest->Text,$USER->Browsers[1]->ChatRequest->Id),"sys","");

                $USER->AddFunctionCall("lz_chat_invite_timer=setTimeout('lz_chat_open(".To::BoolString($sound).");',2000);",false);
                $setGroup = true;
                $USER->Browsers[0]->GroupId = $USER->Browsers[1]->ChatRequest->SenderGroupId;
                $USER->AddFunctionCall("lz_chat_set_talk_to_human(true,false);",false);
                $USER->AddFunctionCall("lz_chat_update_ui_elements();",false);
                $USER->Browsers[1]->ChatRequest->SetStatus(true,false,false);
                $USER->Browsers[1]->ChatRequest->Displayed=true;
                $USER->Browsers[0]->SetTargetGroup($USER->Browsers[1]->ChatRequest->SenderGroupId);
            }

            if(!empty($_GET["mi0"]))
            {
                $USER->Browsers[1]->ChatRequest->SetStatus(true,true,false,true);
            }
        }
    }

    $tymes = (!empty($USER->Browsers[0]->OperatorId) && Server::$Operators[$USER->Browsers[0]->OperatorId]->Typing==$USER->Browsers[0]->SystemId) ? "'".base64_encode(str_replace("<!--operator_name-->",Server::$Operators[$USER->Browsers[0]->OperatorId]->Fullname,LocalizationManager::$TranslationStrings["client_representative_is_typing"]))."'" : "null";

    if(empty($USER->Browsers[0]->GroupChat))
        $USER->AddFunctionCall("lz_chat_set_typing(".$tymes.",false);",false);
    else
        $USER->AddFunctionCall("lz_chat_set_typing(null,false);",false);

    $OVERLAY->BuildElements();

    if($OVERLAY->FullLoad)
        $OVERLAY->OperatorPostCount=0;

    if($OVERLAY->Flags["LPP"] == $USER->Browsers[0]->SystemId)
        $OVERLAY->OperatorPostCount=-1;

    if(!empty($OVERLAY->SpeakingToHTML) && !$OVERLAY->SpeakingToAdded)
        $OVERLAY->AddHTML($OVERLAY->SpeakingToHTML,"sys","SPKT" . Server::$Operators[$USER->Browsers[0]->OperatorId]->SystemId);

    if(!empty($OVERLAY->PostHTML))
        $OVERLAY->AddHTML($OVERLAY->PostHTML,$OVERLAY->Flags["LPP"]);

    if(!empty($OVERLAY->LastPost))
        $USER->AddFunctionCall("lz_chat_set_last_post('".base64_encode(trim(html_entity_decode($OVERLAY->LastPost,ENT_COMPAT,"UTF-8")))."');",false);

    if($OVERLAY->PlaySound)
        $USER->AddFunctionCall("lz_chat_play_sound('message');",false);

    $OVERLAY->OverlayHTML = str_replace("<!--server-->",LIVEZILLA_URL,$OVERLAY->OverlayHTML);

    if($OVERLAY->LanguageRequired)
        $OVERLAY->OverlayHTML = Server::Replace($OVERLAY->OverlayHTML,$OVERLAY->LanguageRequired,false);

    if(!empty($OVERLAY->OverlayHTML))
        $USER->AddFunctionCall("lz_chat_add_html_element('".base64_encode($OVERLAY->OverlayHTML)."',true,".$OVERLAY->LastPostReceived.",".$OVERLAY->LastMessageReceived.",'".base64_encode($OVERLAY->LastPoster)."','".base64_encode(Communication::ReadParameter("lp",""))."',".$OVERLAY->OperatorPostCount.");",false);

    if(!$OVERLAY->IsChatAvailable)
        $USER->AddFunctionCall("lz_chat_set_connecting(false,'".$USER->Browsers[0]->SystemId."',false,null,0);",false);
    else
        $USER->AddFunctionCall("lz_chat_set_connecting(".To::BoolString(empty($USER->Browsers[0]->GroupChat) && !$OVERLAY->Botmode && (!empty($USER->Browsers[0]->ChatId) && !$USER->Browsers[0]->InternalActivation && !$USER->Browsers[0]->Closed && !$USER->Browsers[0]->Declined)).",'".$USER->Browsers[0]->SystemId."',".To::BoolString(!empty($USER->Browsers[0]->OperatorId) && Server::$Operators[$USER->Browsers[0]->OperatorId]->Status==USER_STATUS_AWAY).",".$OVERLAY->GetWaitingMessage().",".intval(Server::$Configuration->File["gl_wmes"]).");",false);

    if($OVERLAY->RepollRequired)
        $USER->AddFunctionCall("lz_tracking_poll_server(1211);",false);

    if($USER->Browsers[0]->TranslationSettings != null)
        $USER->AddFunctionCall("lz_chat_set_translation(". $USER->Browsers[0]->TranslationSettings[0] . ",'". base64_encode($USER->Browsers[0]->TranslationSettings[1]) . "','" . base64_encode($USER->Browsers[0]->TranslationSettings[2]) . "');",false);
    else
        $USER->AddFunctionCall("lz_chat_set_translation(null,null,null);",false);

    if($OVERLAY->FullLoad)
        $USER->AddFunctionCall("lz_chat_load_input_values(false);",false);

    $USER->ReloadGroups(true,Visitor::$PollCount == 1);

    if(!empty($USER->Browsers[0]->DesiredChatGroup))
        $USER->AddFunctionCall("lz_chat_set_input_fields();",false);
    else
        $USER->AddFunctionCall(false,false,false,false);

    $USER->AddFunctionCall("lz_chat_set_application_status(".To::BoolString(!$showWidgets).",".To::BoolString($OVERLAY->IsChatAvailable).",".To::BoolString($OVERLAY->Botmode).",".To::BoolString($OVERLAY->HumanGeneral).",'".$OVERLAY->BotTitle."',".$OVERLAY->GetChatStatus().",".To::BoolString($USER->Browsers[0]->Declined).");",false);

    if($setGroup)
    {
        $USER->AddFunctionCall("lz_chat_set_group('".base64_encode($USER->Browsers[0]->GroupId)."');",false);
    }
}
OverlayChat::$Response = $USER->Response;
?>
