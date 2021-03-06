<?php
/****************************************************************************************
* LiveZilla definitions.inc.php
* 
* Copyright 2017 LiveZilla GmbH
* All rights reserved.
* LiveZilla is a registered trademark.
* 
***************************************************************************************/ 

define("VERSION","7.0.2.9");
define("SYSTEM","SYSTEM");
define("DEBUG_MODE",true);
define("PHP_NEEDED_MAJOR",5);
define("PHP_NEEDED_MINOR",1);
define("PHP_NEEDED_BUILD",2);
define("MYSQL_NEEDED_MAJOR",5);
define("PROTOCOL","livezilla");
define("USER_ID_LENGTH",10);
define("DATA_ITEM_LOADS",20);
define("DATA_DEMAND_LOADS",20);
define("TRANSLATION_STRING_COUNT",171);
define("OO_TRACKING_FILTER_NAME","OOTF");
define("DATA_LIFETIME",2592000);
define("MAX_UPLOAD_SIZE_DEFAULT",51200000);
define("MAX_INPUT_LENGTH",64000);
define("MAX_INPUT_LENGTH_OVERLAY",600);
define("MAX_MAIL_PER_MINUTE",1);
define("TICKET_NO_WT",2000000000);
define("MAX_TICKETS_PER_DAY",!DEBUG_MODE ? 20 : 300);
define("MAX_FEEDBACKS_PER_DAY",!DEBUG_MODE ? 5 : 200);
define("MAX_LOGIN_ATTEMPTS",5);
define("ALLOCATION_MODE_ALL",1);
define("CALLER_TYPE_INTERNAL","intern");
define("CALLER_TYPE_EXTERNAL","extern");
define("CALLER_TYPE_TRACK","track");
define("CALLER_TYPE_OVL","ovl");
define("CONNECTION_ERROR_SPAN",30);
define("PERMISSION_FULL",2);
define("PERMISSION_RELATED",1);
define("PERMISSION_NONE",0);
define("PERMISSION_VOID",-1);
define("PERMISSION_TICKETS",0);
define("PERMISSION_FEEDBACK",1);
define("PERMISSION_CHAT_ARCHIVE",2);
define("PERMISSION_REPORTS",5);
define("PERMISSION_MONITORING",6);
define("PERMISSION_RESOURCES",3);
define("PERMISSION_CHATS",13);
define("CHAT_CLOSED",1);
define("CHAT_STATUS_OPEN",0);
define("CHAT_STATUS_WAITING",1);
define("CHAT_STATUS_ACTIVE",2);
define("CHAT_STATUS_DECLINED",3);
define("USER_STATUS_ONLINE",0);
define("USER_STATUS_BUSY",1);
define("USER_STATUS_OFFLINE",2);
define("USER_STATUS_AWAY",3);
define("TICKET_STATUS_CLOSED",2);
define("USER_TYPE_OPERATOR",1);
define("USER_TYPE_EXTERNAL",2);
define("USER_LEVEL_ADMIN",1);
define("GROUP_STATUS_AVAILABLE",0);
define("GROUP_STATUS_BUSY",1);
define("GROUP_STATUS_UNAVAILABLE",2);
define("POST_ACTION_VALUE_SPLITTER","><");
define("POST_ACTION_ADD",0);
define("POST_ACTION_EDIT",1);
define("POST_ACTION_REMOVE",2);
define("DATA_RESPONSE_TYPE_STATIC",2);
define("DATA_RESPONSE_TYPE_BASIC",1);
define("DATA_RESPONSE_TYPE_KEEP_ALIVE",0);
define("GROUP_EVERYONE_INTERN","everyoneintern");
define("GROUP_EVERYONE_EXTERN","everyoneextern");
define("BROWSER_TYPE_BROWSER",0);
define("BROWSER_TYPE_CHAT",1);
define("RESOURCE_TYPE_FILE_INTERNAL",3);
define("RESOURCE_TYPE_FILE_EXTERNAL",4);
define("LOGIN_REPLY_BAD_COMBINATION",0);
define("LOGIN_REPLY_SUCCEEDED",1);
define("LOGIN_REPLY_ALREADY_ONLINE",2);
define("LOGIN_REPLY_SIGN_OFF_REQUEST",3);
define("LOGIN_REPLY_SESSION_TIMEOUT",4);
define("LOGIN_REPLY_ACCOUNT_DEACTIVATED",15);
define("LOGIN_REPLY_NO_MOBILE_ACCESS",19);
define("LOGIN_REPLY_CHANGE_PASS",5);
define("LOGIN_REPLY_NOADMIN",9);
define("LOGIN_REPLY_DEACTIVATED",10);
define("LOGIN_REPLY_DB",13);
define("LOGIN_REPLY_HTTPS",14);
define("FILTER_EXERTION_BLACK",0);
define("FILTER_EXERTION_WHITE",1);
define("FILTER_TYPE_ACTIVE",1);
define("FILTER_TYPE_INACTIVE",0);
define("FLOOD_PROTECTION_SESSIONS",30);
define("FLOOD_PROTECTION_TIME",60);
define("CONFIG_LIVEZILLA_GEO_PREMIUM","https://ssl.livezilla.net/geo/resolute/");
define("CONFIG_LIVEZILLA_FAQ","http://www.livezilla.net/faq/");
define("CONFIG_LIVEZILLA_PUSH","https://ssl.livezilla.info/");
define("CONFIG_LIVEZILLA_SOCIAL","https://ssl.livezilla.info/social/");
//define("CONFIG_LIVEZILLA_SOCIAL","http://localhost/ssl.livezilla.info/social/");
define("EXTERN_ACTION_RELOAD_GROUPS","reloadgroups");
define("EXTERN_ACTION_LISTEN","listen");
define("EXTERN_ACTION_MAIL","mail");
define("EXTERN_ACTION_RATE","rate");
define("INTERN_ACTION_LISTEN","listen");
define("INTERN_ACTION_OPTIMIZE_TABLES","optimize");
define("INTERN_ACTION_REPORTS","reports");
define("INTERN_ACTION_LOGIN","login");
define("INTERN_ACTION_SET_MANAGEMENT","update_management");
define("INTERN_ACTION_SET_CONFIG","set_config");
define("INTERN_ACTION_DATABASE_TEST","database_test");
define("INTERN_ACTION_CREATE_TABLES","create_tables");
define("INTERN_ACTION_SEND_FILE","send_file");
define("INTERN_ACTION_SEND_TEST_MAIL","send_test_mail");
define("INTERN_ACTION_LDAP_TEST","ldap_test");
define("INTERN_ACTION_LDAP_SEARCH","ldap_search");
define("INTERN_ACTION_REMOVE_FILE","remove_file");
define("INTERN_ACTION_SET_AVAILABILITY","set_availability");
define("INTERN_ACTION_GET_ICON_LIST","get_banner_list");
define("INTERN_ACTION_KB_ACTIONS","kb_action");
define("INTERN_ACTION_DOWNLOAD_TRANSLATION","download_translation");
define("XML_CLIP_NULL","N");
@define("AGENT_TYPE_CRAWLER","0");
@define("AGENT_TYPE_BROWSER","1");
@define("AGENT_TYPE_APPLICATION","2");
@define("AGENT_TYPE_UNKNOWN","3");

define("ST_ACTION_FORWARDED_CHAT", 2);
define("ST_ACTION_INTERNAL_POST", 3);
define("ST_ACTION_EXTERNAL_POST", 4);
define("ST_ACTION_LOG_STATUS", 5);
define("ST_ACTION_LOG_CRAWLER_ACCESS", 6);
define("ST_ACTION_GOAL", 7);
define("STATISTIC_PERIOD_TYPE_DAY", "day");
define("STATISTIC_PERIOD_TYPE_MONTH", "month");
define("STATISTIC_PERIOD_TYPE_YEAR", "year");

define("PATH_CONFIG",LIVEZILLA_PATH . "_config/");
define("PATH_GROUPS",LIVEZILLA_PATH . "_groups/");
define("PATH_UPLOADS_INTERNAL",LIVEZILLA_PATH . "uploads/internal/");
define("PATH_UPLOADS_EXTERNAL",LIVEZILLA_PATH . "uploads/external/");
define("PATH_UPLOADS",LIVEZILLA_PATH . "uploads/");
define("PATH_IMAGES",LIVEZILLA_PATH . "images/");
define("PATH_LOG",LIVEZILLA_PATH . "_log/");
define("PATH_TEMPLATES",LIVEZILLA_PATH . "templates/");
define("PATH_LOCALIZATION",LIVEZILLA_PATH . "_language/");
define("FILE_ACTION_SUCCEEDED",1);
define("FILE_ACTION_ERROR",2);
define("FILE_ACTION_NONE",0);
define("FILE_GENERAL_LOG",PATH_LOG . "general.log");
define("FILE_ERROR_LOG",PATH_LOG . "error_php.log");
define("FILE_SQL_ERROR_LOG",PATH_LOG . "error_sql.log");
define("FILE_LDAP_LOG",PATH_LOG . "error_ldap.log");
define("FILE_EMAIL_LOG",PATH_LOG . "error_email.log");
define("FILE_SERVER_DISABLED",PATH_CONFIG . "_SERVER_DISABLED_");
define("FILE_SERVER_FILE","server.php");
define("FILE_TYPE_USERFILE","user_file");
define("FILE_CARRIERLOGO",PATH_IMAGES . "carrier_logo.png");
define("FILE_CARRIERHEADER",PATH_IMAGES . "carrier_header.gif");
define("FILE_TYPE_ADMIN_BANNER","administrator_banner");
define("FILE_INDEX","index.html");
define("FILE_INDEX_OLD","index.htm");
define("FILE_CHAT","chat.php");
define("FILE_CONFIG",LIVEZILLA_PATH . "_config/config.php");
define("FILE_CONFIG_OLD",LIVEZILLA_PATH . "_config/config.inc.php");
define("FILE_INSTALLER",LIVEZILLA_PATH . "install/install.php");
define("FOLDER_INSTALLER",LIVEZILLA_PATH . "install");
define("SCHEME_HTTP","http://");
define("SCHEME_HTTP_SECURE","https://");
define("EX_FILE_UPLOAD_REQUEST","lzar");

define("DATABASE_INFO","info");
define("DATABASE_CHAT_ARCHIVE","chat_archive");
define("DATABASE_RESOURCES","resources");
define("DATABASE_PREDEFINED","predefined");
define("DATABASE_CHAT_FORWARDS","chat_forwards");
define("DATABASE_GROUPS","groups");
define("DATABASE_GROUP_MEMBERS","group_members");
define("DATABASE_POSTS","chat_posts");
define("DATABASE_TICKETS","tickets");
define("DATABASE_TICKET_MESSAGES","ticket_messages");
define("DATABASE_TICKET_ATTACHMENTS","ticket_attachments");
define("DATABASE_TICKET_EDITORS","ticket_editors");
define("DATABASE_TICKET_CUSTOMS","ticket_customs");
define("DATABASE_TICKET_EMAILS","ticket_emails");
define("DATABASE_TICKET_LOGS","ticket_logs");
define("DATABASE_TICKET_WATCHER","ticket_watcher");
define("DATABASE_TICKET_COMMENTS","ticket_comments");
define("DATABASE_TICKET_SUBS","ticket_subs");
define("DATABASE_MAILBOXES","mailboxes");
define("DATABASE_SIGNATURES","signatures");
define("DATABASE_SOCIAL_MEDIA_CHANNELS","social_media_channels");
define("DATABASE_EVENTS","events");
define("DATABASE_EVENT_ACTIONS","event_actions");
define("DATABASE_EVENT_ACTION_RECEIVERS","event_action_receivers");
define("DATABASE_EVENT_ACTION_SENDERS","event_action_senders");
define("DATABASE_EVENT_ACTION_INTERNALS","event_action_internals");
define("DATABASE_EVENT_TRIGGERS","event_triggers");
define("DATABASE_EVENT_URLS","event_urls");
define("DATABASE_EVENT_FUNNELS","event_funnels");
define("DATABASE_CHAT_REQUESTS","chat_requests");
define("DATABASE_VISITOR_DATA_BROWSERS","visitor_data_browsers");
define("DATABASE_VISITOR_DATA_SYSTEMS","visitor_data_systems");
define("DATABASE_VISITOR_DATA_RESOLUTIONS","visitor_data_resolutions");
define("DATABASE_VISITOR_DATA_CITIES","visitor_data_cities");
define("DATABASE_VISITOR_DATA_REGIONS","visitor_data_regions");
define("DATABASE_VISITOR_DATA_ISPS","visitor_data_isps");
define("DATABASE_VISITOR_DATA_PAGES","visitor_data_pages");
define("DATABASE_VISITOR_DATA_DOMAINS","visitor_data_domains");
define("DATABASE_VISITOR_DATA_PATHS","visitor_data_paths");
define("DATABASE_VISITOR_DATA_CRAWLERS","visitor_data_crawlers");
define("DATABASE_VISITOR_DATA_QUERIES","visitor_data_queries");
define("DATABASE_VISITOR_DATA_TITLES","visitor_data_titles");
define("DATABASE_FILTERS","filters");
define("DATABASE_VISITORS","visitors");
define("DATABASE_VISITOR_CHATS","visitor_chats");
define("DATABASE_VISITOR_CHAT_OPERATORS","visitor_chat_operators");
define("DATABASE_VISITOR_BROWSERS","visitor_browsers");
define("DATABASE_VISITOR_COMMENTS","visitor_comments");
define("DATABASE_VISITOR_BROWSER_URLS","visitor_browser_urls");
define("DATABASE_OPERATOR_STATUS","operator_status");
define("DATABASE_OPERATORS","operators");
define("DATABASE_OPERATOR_LOGINS","operator_logins");
define("DATABASE_STATS_AGGS","stats_aggs");
define("DATABASE_STATS_AGGS_BROWSERS","stats_aggs_browsers");
define("DATABASE_STATS_AGGS_RESOLUTIONS","stats_aggs_resolutions");
define("DATABASE_STATS_AGGS_COUNTRIES","stats_aggs_countries");
define("DATABASE_STATS_AGGS_VISITS","stats_aggs_visits");
define("DATABASE_STATS_AGGS_SYSTEMS","stats_aggs_systems");
define("DATABASE_STATS_AGGS_LANGUAGES","stats_aggs_languages");
define("DATABASE_STATS_AGGS_CITIES","stats_aggs_cities");
define("DATABASE_STATS_AGGS_REGIONS","stats_aggs_regions");
define("DATABASE_STATS_AGGS_ISPS","stats_aggs_isps");
define("DATABASE_STATS_AGGS_QUERIES","stats_aggs_queries");
define("DATABASE_STATS_AGGS_PAGES","stats_aggs_pages");
define("DATABASE_STATS_AGGS_DOMAINS","stats_aggs_domains");
define("DATABASE_STATS_AGGS_REFERRERS","stats_aggs_referrers");
define("DATABASE_STATS_AGGS_AVAILABILITIES","stats_aggs_availabilities");
define("DATABASE_STATS_AGGS_FEEDBACKS","stats_aggs_feedbacks");
define("DATABASE_STATS_AGGS_DURATIONS","stats_aggs_durations");
define("DATABASE_STATS_AGGS_CHATS","stats_aggs_chats");
define("DATABASE_STATS_AGGS_TICKETS","stats_aggs_tickets");
define("DATABASE_STATS_AGGS_SEARCH_ENGINES","stats_aggs_search_engines");
define("DATABASE_STATS_AGGS_VISITORS","stats_aggs_visitors");
define("DATABASE_STATS_AGGS_CRAWLERS","stats_aggs_crawlers");
define("DATABASE_STATS_AGGS_PAGES_ENTRANCE","stats_aggs_pages_entrance");
define("DATABASE_STATS_AGGS_PAGES_EXIT","stats_aggs_pages_exit");
define("DATABASE_STATS_AGGS_GOALS","stats_aggs_goals");
define("DATABASE_STATS_AGGS_GOALS_QUERIES","stats_aggs_goals_queries");
define("DATABASE_STATS_AGGS_KNOWLEDGEBASE","stats_aggs_knowledgebase");
define("DATABASE_EVENT_GOALS","event_goals");
define("DATABASE_AUTO_REPLIES","auto_replies");
define("DATABASE_GOALS","goals");
define("DATABASE_CODES","codes");
define("DATABASE_ADMINISTRATION_LOG","administration_log");
define("DATABASE_IMAGES","images");
define("DATABASE_VISITOR_GOALS","visitor_goals");
define("DATABASE_PUSH_MESSAGES","push_messages");
define("DATABASE_DATA_UPDATES","data_updates");
define("DATABASE_CONFIG","config");
define("DATABASE_DATA_CACHE","data_cache");
define("DATABASE_USER_DATA","user_data");
define("DATABASE_FEEDBACKS","feedbacks");
define("DATABASE_FEEDBACK_CRITERIA","feedback_criteria");
define("DATABASE_FEEDBACK_CRITERIA_CONFIG","feedback_criteria_config");
define("DATABASE_KNOWLEDGEBASE_QUERIES","knowledgebase_queries");
define("DATABASE_KNOWLEDGEBASE_VIEWS","knowledgebase_views");

define("DATA_UPDATE_KEY_TICKETS","update_tickets");
define("DATA_UPDATE_KEY_REPORTS","update_reports");
define("DATA_UPDATE_KEY_FEEDBACKS","update_feedbacks");
define("DATA_UPDATE_KEY_EMAILS","update_emails");
define("DATA_UPDATE_KEY_EVENTS","update_events");
define("DATA_UPDATE_KEY_CHAT_ARCH","update_archive");
define("DATA_UPDATE_KEY_FILTERS","update_filters");

define("DATA_CACHE_KEY_EVENTS",112);
define("DATA_CACHE_KEY_OPERATORS",113);
define("DATA_CACHE_KEY_GROUPS",114);
define("DATA_CACHE_KEY_FILTERS",115);
define("DATA_CACHE_KEY_DBCONFIG",116);
define("DATA_CACHE_KEY_STATS",117);
define("DATA_CACHE_KEY_DATA_TIMES",118);

define("FILTER_VALIDATE_REGEXP_HEXCOLOR","/^#(?:(?:[a-f0-9]{3}){1,2})$/i");
if(!defined("FILTER_VALIDATE_INT"))define("FILTER_VALIDATE_INT",false);
if(!defined("FILTER_VALIDATE_REGEXP"))define("FILTER_VALIDATE_REGEXP",false);
if(!defined("FILTER_SANITIZE_URL"))define("FILTER_SANITIZE_URL",false);
if(!defined("FILTER_SANITIZE_SPECIAL_CHARS"))define("FILTER_SANITIZE_SPECIAL_CHARS",false);
if(!defined("FILTER_VALIDATE_FLOAT"))define("FILTER_VALIDATE_FLOAT",false);
if(!defined("FILTER_HTML_ENTITIES"))define("FILTER_HTML_ENTITIES","FILTER_HTML_ENTITIES");

?>