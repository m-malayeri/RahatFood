<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Redirect;
use Auth;
use Carbon\Carbon;
use Storage;

// Models ------------------------------------------------- 
use App\areas;
use App\restaurants;
use App\orders;
use App\User;

class AdminController extends Controller{
	public function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
	public function calc_profit($orders){
		$count=0;
		foreach($orders as $order){
			$restaurant=restaurants::get_rest_details($order->vendor_id);
			$count+=(($order->cart_total)*$restaurant->profit)/100;
		}
		return $count;
	}
	public function show_users(){
		$total_users=User::get_admin_total_users('1');
		$reports["total_users"]=count($total_users);
		return view('admin.users')->with(compact('total_users','reports'));
	}
	public function show_restaurants(){
		$restaurants=restaurants::get_admin_total_restaurants();
		$areas=areas::get_admin_total_areas();
		$total_vendors=restaurants::get_admin_total_vendors();
		$reports["total_vendors"]=$total_vendors;
		$total_foods=restaurants::get_admin_total_foods();
		$reports["total_foods"]=$total_foods;
		return view('admin.restaurants')->with(compact('restaurants','areas','reports'));
	}
	public function save_restaurant(Request $request){
		if(request()->file('cover')!=null)
			$cover=request()->file('cover')->store('public');
		else
			$cover="rest-cover-default.jpg";
		if(request()->file('logo')!=null)
			$logo=request()->file('logo')->store('public');
		else
			$logo="rest-logo-default.jpg";
		$array =array(
			'id'=>$request->input('id'),
			'name'=>$request->input('name'),
			'manager'=>$request->input('manager'),
			'profit'=>$request->input('profit'),
			'address'=>$request->input('address'),
			'lunch_start'=>$request->input('lunch_start'),
			'lunch_end'=>$request->input('lunch_end'),
			'dinner_start'=>$request->input('dinner_start'),
			'dinner_end'=>$request->input('dinner_end'),
			'cover'=>$cover,
			'logo'=>$logo,
			'discount'=>$request->input('discount'),
			'deliver_time'=>$request->input('deliver_time'),
			'deliver_fee'=>$request->input('deliver_fee')
		);
		restaurants::save_restaurant($array);
		
		$areas=areas::get_admin_total_areas();
		foreach($areas as $area){
			if($request->input($area->id)==1){
				$array =array(
					'area_id'=>$area->id,
					'restaurant_id'=>$request->input('id')
				);
				areas::save_restaurant_coverage($array);
			}
		}
		return Redirect::to('/admin/restaurants')->withMessage('ثبت رستوران جدید با موفقیت انجام شد');
	}
	public function calc_reports($all_orders){
		$reports["orders"]=count($all_orders);
		$reports["income"]=$all_orders->where('status', 3)->sum(['cart_total']);
		$reports["profit"]=$this->calc_profit($all_orders->where('status', 3));
		$reports["orders_init"] = count($all_orders->where('status', 0));
		$reports["orders_ready"] = count($all_orders->where('status', 1));
		$reports["orders_sent"] = count($all_orders->where('status', 2));
		$reports["orders_delivered"] = count($all_orders->where('status', 3));
		$reports["orders_expired"] = count($all_orders->where('status', 99));
		return $reports;
	}
	public function get_order_details($all_orders){
		$orders=array(array());
		$i=0;
		if(count($all_orders)>0){
			foreach($all_orders as $order){
				$restaurant=restaurants::get_rest_details($order->vendor_id);
				$orders[$i]["basket_id"]=$order->basket_id;
				$orders[$i]["customer_name"]=$order->customer_name;
				$orders[$i]["customer_id"]=$order->customer_id;
				$orders[$i]["customer_phone"]=$order->customer_phone;
				$orders[$i]["customer_address"]=$order->customer_address;
				$orders[$i]["vendor_name"]=$restaurant->name;
				$orders[$i]["cart_total"]=$order->cart_total;
				$orders[$i]["order_date"]=$order->order_date;
				$orders[$i]["order_time"]=$order->order_time;
				$orders[$i]["order_comment"]=$order->comment;
				$orders[$i]["payment_method"]=$order->payment_method;
				$orders[$i]["status"]=$order->status;
				$i++;
			}
		}
		return $orders;
	}
	public function get_orders_basket($all_orders){
		$r=0;$n=0;
		foreach($all_orders as $order){
			$basket=orders::get_basket($order["basket_id"]);
			foreach($basket as $c){
				$baskets[$n][$r]=$c;
				$r++;
			}
			$n++;
		}
		return $baskets;
	}
	public function show_today_orders(){
		$today=Carbon::now()->toDateString();
		$orders=orders::get_admin_orders($today,$today);
		$reports=$this->calc_reports($orders);
		if(count($orders)>0){
			$orders=$this->get_order_details($orders);
			$baskets=$this->get_orders_basket($orders);
			return view('admin.orders')->with(compact('reports','orders','baskets'));
		} else return view('admin.orders')->with(compact('reports',null,null));
	}
	public function show_filtered_orders(Request $request){
		$start_day=$request->input('start_day');
		$start_month=$request->input('start_month');
		$start_year=$request->input('start_year');
		$end_day=$request->input('end_day');
		$end_month=$request->input('end_month');
		$end_year=$request->input('end_year');
		$start=\Morilog\Jalali\jDateTime::toGregorian($start_year, $start_month, $start_day);
		$start=Carbon::createFromDate($start[0],$start[1],$start[2])->toDateString(); 
		$end=\Morilog\Jalali\jDateTime::toGregorian($end_year, $end_month, $end_day);
		$end=Carbon::createFromDate($end[0],$end[1],$end[2])->toDateString(); 
		$orders=orders::get_admin_orders($start,$end);
		if(count($orders)>0){
			$reports=$this->calc_reports($orders);
			$orders=$this->get_order_details($orders);
			$baskets=$this->get_orders_basket($orders);
			return view('admin.orders')->with(compact('reports','start','end','orders','baskets'));
		} else return view('admin.orders')->with(compact('reports','start','end',null,null));
	}
	public function order_expired($basket_id){
		orders::order_expired($basket_id);
		return Redirect::to('/admin/orders')->withMessage('تغییر وضعیت سفارش به منقضی شده با موفقیت انجام شد');
	}
	public function show_track_page(){
		return view('admin.track');
	}
	public function track_order(Request $request){
		$order=orders::get_order_details($request->input('order_id'));
		if(count($order)>0){
			$restaurant=restaurants::get_rest_details($order->vendor_id);
			$order->vendor_name=$restaurant->name;
			$basket=orders::get_basket($request->input('order_id'));
			return view('admin.track')->with(compact('order','basket'));
		}else return Redirect::to('/admin/track')->withError('کد رهگیری وارد شده در بانک اطلاعاتی موجود نیست');
	}
	public function sitemap_g(){
		$xml='
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
	<url>
		<loc>http://www.rahatfood.com/</loc>
		<lastmod>2017-01-01</lastmod>
		<changefreq>yearly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>http://www.rahatfood.com/info</loc>
		<lastmod>2017-01-01</lastmod>
		<changefreq>yearly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>http://www.rahatfood.com/login</loc>
		<lastmod>2017-01-01</lastmod>
		<changefreq>yearly</changefreq>
		<priority>0.8</priority>
	</url>
	<url>
		<loc>http://www.rahatfood.com/register</loc>
		<lastmod>2017-01-01</lastmod>
		<changefreq>yearly</changefreq>
		<priority>0.8</priority>
	</url>';
		$areas=areas::get_all();
		foreach($areas as $area){
			$xml = $xml . '
	<url>
		<loc>http://www.rahatfood.com/area/'.$area->id.'/'.$area->name.'</loc>
		<lastmod>2017-04-01</lastmod>
		<changefreq>monthly</changefreq>
		<priority>0.8</priority>
	</url>';
		}
		$xml = $xml . '
</urlset>';
		Storage::disk('local')->put('sitemap.xml', $xml);
	}
}
