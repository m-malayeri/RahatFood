<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use DB;
use PDO;
use Carbon\Carbon;

class orders extends \Eloquent{
    protected $guarded = array();
    protected $table = 'orders'; // table name
    public $timestamps = 'false' ; // to disable default timestamp fields
    
	public static function get_admin_orders($start,$end){
		$result = DB::table('orders')->whereDate('order_date',">=", $start)->whereDate('order_date',"<=", $end)->orderBy('order_date', 'desc')->orderBy('order_time', 'desc')->get();
		return $result;
	}
	public static function get_vendor_orders($vendor_id,$start,$end){
		$result = DB::table('orders')->where('vendor_id',$vendor_id)->whereDate('order_date',">=", $start)->whereDate('order_date',"<=", $end)->orderBy('order_date', 'desc')->orderBy('order_time', 'desc')->where('status','>','0')->get();
		return $result;
	}
	public static function get_admin_total_orders(){
		$result = DB::table('orders')->get();
		return $result;
	}
	public static function get_vendor_total_orders($vendor_id){
		$result = DB::table('orders')->where('vendor_id',$vendor_id)->get();
		return $result;
	}
	public static function save_order($data){
		DB::table('orders')->insert($data);
		return DB::getPdo()->lastInsertId();
	}
	public static function save_basket($data){
		DB::table('baskets')->insert($data);
	}
	public static function get_user_orders($data){
		$result = DB::table('orders')->where('customer_id',$data)->orderBy('order_date', 'desc')->orderBy('order_time', 'desc')->get();
		return $result;
	}
	public static function get_basket($data){
		DB::setFetchMode(PDO::FETCH_ASSOC);
		$basket = DB::table('baskets')->where('basket_id',$data)->get();
		DB::setFetchMode(PDO::FETCH_CLASS);
		return $basket;
	}
	public static function get_order_details($data){
		$result=DB::table('orders')->where('basket_id', $data)->get();
		if(count($result)>0)
			return $result[0];
		else return null;
	}
	public static function update_order_trans($order_id,$trans_id){
		DB::table('orders')->where('basket_id', $order_id)->update(['trans_id' => $trans_id]);
	}
	public static function update_order_status($order_id){
		DB::table('orders')->where('basket_id', $order_id)->update(['status' => "1"]);
	}
	public static function validate_trans_id($order_id,$trans_id){
		$result=DB::table('orders')->where('basket_id', $order_id)->where('trans_id', $trans_id)->get();
		if(count($result)>0)
			return true;
		else
			return false;
	}
	public static function order_sent($data){
		DB::table('orders')->where('basket_id', $data)->update(['status' => "2"]);
	}
	public static function order_delivered($data){
		DB::table('orders')->where('basket_id', $data)->update(['status' => "3"]);
	}
	public static function order_expired($data){
		DB::table('orders')->where('basket_id', $data)->update(['status' => "99"]);
	}
}