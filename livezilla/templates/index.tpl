<!DOCTYPE HTML>
<html>
<head>
	<title>LiveZilla Server Page</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="robots" content="index, follow">
	<meta http-equiv="Content-type" content="text/html;charset=UTF-8">
    <meta name="viewport" content="width=device-width">
	<link rel="shortcut icon" href="./images/favicon.ico" type="image/x-icon">
    <link rel="stylesheet" type="text/css" href="./templates/style_index.css">
    <link rel="stylesheet" type="text/css" href="./mobile/css/livezilla.css">
    <link rel="stylesheet" type="text/css" href="./mobile/css/livezilla6.css">
    <link rel="stylesheet" type="text/css" href="./mobile/css/livezilla6Controls.css">
    <link rel="stylesheet" type="text/css" href="./fonts/font-awesome.min.css">
    <script type="text/javascript" src="./mobile/js/md5.js"></script>
    <script type="text/javascript" src="./mobile/js/utf8.js"></script>
    <script type="text/javascript" src="./mobile/js/basesf.js"></script>
    <script type="text/javascript" src="./mobile/js/lzm/classes/CommonToolsClass.js"></script>
    <script type="text/javascript" src="./mobile/js/jquery-2.1.0.min.js"></script>
    <script type="text/javascript" src="./mobile/js/lzm/classes/CommonInputControlsClass.js"></script>
    <script type="text/javascript" src="./mobile/js/lzm/classes/CommonTranslationClass.js"></script>
    <script type="text/javascript" src="./mobile/js/lzm/classes/CommonDialogClass.js"></script>
    <script type="text/javascript" src="./templates/jscript/index.js"></script>
    <script>

        var lz_index_language = {
        };
        lz_index_language['accept_terms'] = "<!--lang_index_accept_terms-->";
        lz_index_language['update_start'] = "<!--lang_index_update_start-->";
        lz_index_language['install_start'] = "<!--lang_index_install_start-->";
        lz_index_language['install_finish'] = "<!--lang_index_install_finish-->";
        lz_index_language['install_finish_text'] = "<!--lang_index_install_finish_text-->";
        lz_index_language['install_finish_cache'] = "<!--lang_index_install_finish_cache-->";
        lz_index_language['install_start_header'] = "<!--lang_index_install_start_header-->";
        lz_index_language['install_finish_header'] = "<!--lang_index_install_finish_header-->";
        lz_index_language['install_user'] = "<!--lang_index_install_user-->";
        lz_index_language['install_privacy'] = "<!--lang_index_install_privacy-->";
        lz_index_language['install_db'] = "<!--lang_index_install_db-->";
        lz_index_language['tables_created'] = "<!--lang_index_tables_created-->";
        lz_index_language['tables_updated'] = "<!--lang_index_tables_updated-->";
        lz_index_language['table_update'] = "<!--lang_index_table_update-->";
        lz_index_language['table_create'] = "<!--lang_index_table_create-->";
        lz_index_language['config_file_error'] = "<!--lang_index_config_file_error-->";

        lz_index_language['upload_manually_0'] = "<!--lang_index_upload_manually_0-->";
        lz_index_language['upload_manually_1'] = "<!--lang_index_upload_manually_1-->";
        lz_index_language['upload_manually_2'] = "<!--lang_index_upload_manually_2-->";
        lz_index_language['upload_manually_3'] = "<!--lang_index_upload_manually_3-->";

        lz_index_language['change_file_permissions_0'] = "<!--lang_index_change_file_permissions_0-->";
        lz_index_language['change_file_permissions_1'] = "<!--lang_index_change_file_permissions_1-->";
        lz_index_language['change_file_permissions_2'] = "<!--lang_index_change_file_permissions_2-->";

        lz_index_language['next'] = "<!--lang_client_next-->";
        lz_index_language['back'] = "<!--lang_client_back-->";
        lz_index_language['create_tables'] = "<!--lang_index_create_tables-->";
        lz_index_language['update_tables'] = "<!--lang_index_update_tables-->";
        lz_index_language['or'] = "<!--lang_client_or-->";
        lz_index_language['yes'] = "<!--lang_client_yes-->";
        lz_index_language['no'] = "<!--lang_client_no-->";
        lz_index_language['ok'] = "Ok";
        lz_index_language['database_update'] = "<!--lang_index_database_update-->";

        lz_index_language['password_repetition_match'] = "<!--lang_index_password_confirm-->";
        lz_index_language['password_info'] = "<!--lang_index_password_info-->";
        lz_index_language['username'] = "<!--lang_index_username-->";
        lz_index_language['name'] = "<!--lang_index_name-->";
        lz_index_language['email'] = "<!--lang_index_email-->";
        lz_index_language['password'] = "<!--lang_index_password-->";
        lz_index_language['password_confirm'] = "<!--lang_index_password_confirm-->";

        lz_index_language['use_cookies'] = "<!--lang_index_use_cookies-->";
        lz_index_language['cookie_lifetime'] = "<!--lang_index_cookie_lifetime-->";
        lz_index_language['mask_ip'] = "<!--lang_index_mask_ip-->";
        lz_index_language['mask_ip_format'] = "<!--lang_index_mask_ip_format-->";
        lz_index_language['respect_dnt'] = "<!--lang_index_respect_dnt-->";

        var lz_install_mode = <!--install_mode-->;
        var lz_install_possible = <!--install_possible-->;
        var lz_update_mode = <!--update_mode-->;
        var lz_timestamp = <!--timestamp-->;

        var lz_locale = '<!--locale-->';
        var lz_id = '<!--lz_id-->';
        var lz_file_version = '<!--lz_version-->';
        var lz_db_version = '<!--database_version-->';

    </script>
</head>
<body style="overflow: auto;">

    <div style="position:absolute;left:0;bottom:0;overflow:hidden;"><i class="fa fa-cogs bg_icon" id="bg_icon_lb"></i></div>
    <div style="position:absolute;right:0;top:0;overflow:hidden;"><i class="fa fa-cog bg_icon" id="bg_icon_tr"></i></div>

    <div id="index_main_container">
        <img src="./images/lz_index_logo.png" class="index_logo" alt="">
        <br><br><br><br>
        <table>
            <tr>
                <td class="index_dispensable">
                    <div id="index_info" class="index_main_box">
                        <table>
                            <!--infos-->
                        </table>
                    </div>
                    <div id="server_url" class="index_main_box">
                        <!--lang_index_server_url_apps--><br><br>
                        <input id="tb-server-url" type="text" style="text-align: center;color:#666;box-shadow:none;" readonly>
                        <br><br>
                        <a href="http://www.livezilla.net/downloads/en/" target="_blank">LiveZilla APPS</a>
                    </div>
                </td>
                <td>
                    <div id="index_action_box" class="index_main_box index_center_box"></div>
                </td>
                <td>
                    <div id="index_install_progress" class="index_main_box lzm-unselectable">
                        <table>
                            <tr id="install_step_comp" onclick="install_goto(0);"><td><i class="fa fa-check-circle icon-green icon-xl install-progress-icon"></i></td><td><!--lang_index_prerequisites--></td></tr>
                            <tr id="install_step_license" onclick="install_goto(1);"><td><i class="fa fa-circle-thin icon-light icon-xl install-progress-icon"></i></td><td><!--lang_index_license--></td></tr>
                            <tr id="install_step_admin" onclick="install_goto(2);"><td><i class="fa fa-circle-thin icon-light icon-xl install-progress-icon"></i></td><td><!--lang_index_administrator--></td></tr>
                            <tr id="install_step_settings" onclick="install_goto(3);"><td><i class="fa fa-circle-thin icon-light icon-xl install-progress-icon"></i></td><td><!--lang_index_settings--></td></tr>
                            <tr id="install_step_database" onclick="install_goto(4);"><td><i class="fa fa-circle-thin icon-light icon-xl install-progress-icon"></i></td><td><!--lang_index_database--></td></tr>
                            <tr id="install_step_config" onclick="install_goto(5);"><td><i class="fa fa-circle-thin icon-light icon-xl install-progress-icon"></i></td><td><!--lang_index_config_file--></td></tr>
                        </table>
                    </div>
                </td>
                <td id="index_components_box"  class="index_dispensable" style="display:none">
                    <div class="index_main_box">
                        <div><!--lang_index_description_operator_client--></div>
                        <br>
                        <div><a class="index-button index-button-l index-button-blue" href="./mobile/index.php" target="_blank">Operator Console</a></div>
                    </div>
                    <div class="index_main_box">
                        <div><!--lang_index_description_demochat--></div>
                        <br>
                        <div>
                            <a class="index-button index-button-l" onclick="lz_chat_open(false);"><!--lang_client_start_chat--></a>
                        </div>
                        <br>
                        <div>
                            <a href="./knowledgebase.php" target="_blank"><!--lang_index_kb_visit--></a>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
        <br>
        <table id="index_link_table">
            <tr>
                <td><a class="lz_chat_link_no_icon" href="http://www.livezilla.net" title="<!--title-->"><!--title--></a></td>
                <td>|</td>
                <td><a class="lz_chat_link_no_icon" href="http://www.livezilla.net/faq/" title="<!--title--> - Frequently Asked Questions">FAQ</a></td>
                <td>|</td>
                <td><a class="lz_chat_link_no_icon" href="http://www.livezilla.net/downloads/" title="<!--title--> - Downloads and Updates">Updates</a></td>
                <td>|</td>
                <td><a class="lz_chat_link_no_icon" href="http://forums.livezilla.net/" title="<!--title--> - Community Forums">Forums</a></td>
            </tr>
        </table>
        <br>
        <div class="text-gray">LiveZilla is a registered trademark of LiveZilla GmbH</div>
        <br>
        <div class="text-gray"><b>Version <!--lz_version--></b></div>
        <br>
        <div class="text-s text-gray">Server Time: <!--time--> | Server Scheme: <!--scheme--></div>
        <br><br>
    </div>
<!--widget-->

<script>
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange=function()
    {
        if (this.readyState == 4 && this.status == 200)
        {
            var headers = this.getAllResponseHeaders();
            if(headers.toLowerCase().indexOf('sameorigin')>-1 && headers.toLowerCase().indexOf('frame-options')>-1)
                document.getElementById('header_frame_options').style.display='table-row';
        }
    };
    xmlhttp.open("GET", "./index.php", true);
    xmlhttp.send();
</script>
</body>
</html>