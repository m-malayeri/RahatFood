<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Auth::routes();
Route::get('logout', function(){
	Auth::logout();
	return redirect ('/');
});

Route::any('/', function () {return view('welcome');});
Route::any('home', function () {return view('welcome');});
Route::any('info', function () {return view('info');});

Route::any('area/{area_id}',array('uses' => 'UserController@show_nearby_units'));
Route::any('area/{area_id}/{area_name}',array('uses' => 'UserController@show_nearby_units'));
Route::any('area/{area_id}/restaurant/{restaurant_id}/{restaurant_name}',array('uses' => 'UserController@show_restaurant'));
Route::any('search_area',array('uses' => 'UserController@search_area'));
Route::get('geo',array('uses' => 'UserController@search_location'));

Route::get('panel',array('uses' => 'UserController@show_panel'))->middleware('auth');
Route::post('panel/update',array('uses' => 'UserController@update_user_info'))->middleware('auth');

Route::get('cart',array('uses' => 'UserController@show_cart'));
Route::post('user_order',array('uses' => 'UserController@store_user_order'));
Route::post('guest_order',array('uses' => 'UserController@store_guest_order'));
Route::get('guest_order/done',array('uses' => 'UserController@show_guest_page'));
Route::post('payment',array('uses' => 'UserController@payment'));
Route::get('ajax_action',array('uses' => 'UserController@ajax_action'));

Route::get('admin/orders', array('uses' => 'AdminController@show_today_orders'))->middleware('admin');
Route::post('admin/orders/filter_date', array('uses' => 'AdminController@show_filtered_orders'))->middleware('admin');
Route::get('admin/orders/expired/{basket_id}', array('uses' => 'AdminController@order_expired'))->middleware('admin');
Route::get('admin/users', array('uses' => 'AdminController@show_users'))->middleware('admin');
Route::get('admin/restaurants', array('uses' => 'AdminController@show_restaurants'))->middleware('admin');
Route::post('admin/restaurants/add', array('uses' => 'AdminController@save_restaurant'))->middleware('admin');
Route::any('sitemap_g',array('uses' => 'AdminController@sitemap_g'))->middleware('admin');;

Route::get('admin/track', array('uses' => 'AdminController@show_track_page'))->middleware('admin');
Route::get('admin/track_order', array('uses' => 'AdminController@track_order'))->middleware('admin');

Route::get('vendor/orders', array('uses' => 'VendorController@show_today_orders'))->middleware('vendors');
Route::post('vendor/orders/filter_date', array('uses' => 'VendorController@show_filtered_orders'))->middleware('vendors');
Route::get('vendor/edit', array('uses' => 'VendorController@edit_info'))->middleware('vendors');
Route::post('vendor/edit', array('uses' => 'VendorController@update_rest_info'))->middleware('vendors');
Route::get('vendor/orders/sent/{basket_id}', array('uses' => 'VendorController@order_sent'))->middleware('vendors');
Route::get('vendor/orders/delivered/{basket_id}', array('uses' => 'VendorController@order_delivered'))->middleware('vendors');
Route::get('vendor/track', array('uses' => 'VendorController@show_track_page'))->middleware('vendors');
Route::get('vendor/track_order', array('uses' => 'VendorController@track_order'))->middleware('vendors');

Route::resource('vendor/products', 'ProductController');
Route::get('vendor/products/{product_id}/unhide', array('uses' => 'ProductController@unhide'))->middleware('vendors');
Route::get('vendor/products/{product_id}/hide', array('uses' => 'ProductController@hide'))->middleware('vendors');
Route::get('vendor/products/unavailable/{product_id}', array('uses' => 'ProductController@unavailable_product'))->middleware('vendors');
Route::get('vendor/products/available/{product_id}', array('uses' => 'ProductController@available_product'))->middleware('vendors');

Route::post('callback', array('uses' => 'UserController@callback'));

Route::get('storage/public/{filename}', function ($filename)
{
    $path = storage_path('app/public/'.$filename);
    if (!File::exists($path)) {
        abort(404);
    }
    $file = File::get($path);
    $type = File::mimeType($path);
    $response = Response::make($file, 200);
    $response->header("Content-Type", $type);
    return $response;
});
