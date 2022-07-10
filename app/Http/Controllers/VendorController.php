<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Redirect;
use Auth;
use Carbon\Carbon;
use App\Http\Requests\Update_rest_info;

// Models ------------------------------------------------- 
use App\areas;
use App\restaurants;
use App\orders;
use App\User;

class VendorController extends Controller{
	public function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
	public function edit_info(){
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		return view('vendor.edit')->with('vendor',$vendor);
	}
	public function update_rest_info(Update_rest_info $request){
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		restaurants::update_info($request,$vendor->id);
		return Redirect::to('/vendor/orders')->withMessage('به روزرسانی اطلاعات با موفقیت انجام شد');
	}
	public function calc_reports($all_orders){
		$reports["orders"]=count($all_orders);
		$reports["income"]=$all_orders->where('status', 3)->sum(['cart_total']);
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
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		$orders=orders::get_vendor_orders($vendor->id,$today,$today);
		$reports=$this->calc_reports($orders);
		if(count($orders)>0){
			$orders=$this->get_order_details($orders);
			$baskets=$this->get_orders_basket($orders);
			return view('vendor.orders')->with(compact('reports','orders','baskets'));
		} else return view('vendor.orders')->with(compact('reports',null,null));
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
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		$orders=orders::get_vendor_orders($vendor->id,$start,$end);
		if(count($orders)>0){
			$reports=$this->calc_reports($orders);
			$orders=$this->get_order_details($orders);
			$baskets=$this->get_orders_basket($orders);
			return view('vendor.orders')->with(compact('reports','start','end','orders','baskets'));
		} else return view('vendor.orders')->with(compact('reports','start','end',null,null));
	}
	public function order_sent($basket_id){
		$order=orders::get_order_details($basket_id);
		if(count($order)>0){
			$restaurant=restaurants::get_rest_details_by_manager(Auth::user()->email);
			if($order->vendor_id==$restaurant->id){
				orders::order_sent($basket_id);
				return Redirect::to('/vendor/orders')->withMessage('تغییر وضعیت سفارش به ارسال شده با موفقیت انجام شد');
			}else return Redirect::to('/vendor/orders')->withError('این سفارش متعلق به واحد شما نیست');
		}
	}
	public function order_delivered($basket_id){
		$order=orders::get_order_details($basket_id);
		if(count($order)>0){
			$restaurant=restaurants::get_rest_details_by_manager(Auth::user()->email);
			if($order->vendor_id==$restaurant->id){
				orders::order_delivered($basket_id);
				return Redirect::to('/vendor/orders')->withMessage('تغییر وضعیت سفارش به تحویل شده با موفقیت انجام شد');
			}else return Redirect::to('/vendor/orders')->withError('این سفارش متعلق به واحد شما نیست');
		}
	}
	public function show_track_page(){
		return view('vendor.track');
	}
	public function track_order(Request $request){
		$order=orders::get_order_details($request->input('order_id'));
		if(count($order)>0){
			$restaurant=restaurants::get_rest_details_by_manager(Auth::user()->email);
			if($order->vendor_id==$restaurant->id){
				$order->vendor_name=$restaurant->name;
				$basket=orders::get_basket($request->input('order_id'));
				return view('vendor.track')->with(compact('order','basket'));
			}else return Redirect::to('/vendor/track')->withError('کد رهگیری وارد شده متعلق به این واحد نیست');
		}else return Redirect::to('/vendor/track')->withError('کد رهگیری وارد شده در بانک اطلاعاتی موجود نیست');
	}
}