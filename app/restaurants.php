<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use DB;
use PDO;
use Carbon\Carbon;

class restaurants extends \Eloquent{
    protected $guarded = array();
    protected $table = 'restaurants'; // table name
    public $timestamps = 'false' ; // to disable default timestamp fields
	
	public static function get_admin_total_vendors(){
		$result = DB::table('restaurants')->get();
		$total_vendors=count($result);
		return $total_vendors;
	}
	public static function get_admin_total_foods(){
		$result = DB::table('products')->get();
		$total_foods=count($result);
		return $total_foods;
	}
	public static function get_admin_total_restaurants(){
		$result= DB::table('restaurants')->get();
		return $result;
	}
	public static function save_product($data){
		DB::table('products')->insert($data);
	}
	public static function save_restaurant($data){
		DB::table('restaurants')->insert($data);
	}
	public static function get_rest_details($data){
		$result = DB::table('restaurants')->where('id',$data)->get();
		if(count($result)> 0){
			$result=$result[0];
			$result->status=static::compare_between($result->lunch_start, $result->lunch_end, $result->dinner_start, $result->dinner_end);
			return $result;
		}
		else return null;
    }
	public static function get_rest_details_by_manager($data){
		$result = DB::table('restaurants')->where('manager',$data)->get();
		if(count($result)> 0)
			return $result[0];
		else return null;		
	}
	public static function get_rests_details($data){
		$restaurants=array(array());
		$result= DB::table('restaurants')->whereIn('id',$data)->get();
		if(count($result)>0){
			$i=0;
			foreach($result as $row){
				$restaurant=static::get_rest_details($row->id);
				$restaurants[$i]=$restaurant;
				$i++;
			}
			return $restaurants;
		}
		else return null;	
    }
    public static function compare_between($lch_st, $lch_en, $din_st, $din_en){
		$time=Carbon::now();
		$lch_st=Carbon::parse($lch_st);
		$lch_en=Carbon::parse($lch_en);
		$din_st=Carbon::parse($din_st);
		$din_en=Carbon::parse($din_en);
		$status_lch=$time->between($lch_st, $lch_en); 
		$status_din=$time->between($din_st, $din_en); 
		$status=$status_lch || $status_din;
		return $status;
	}
	public static function get_products($data){
		$result = DB::table('products')->where('vendor_id',$data)->orderBy('category_order', 'asc')->get();
		return $result;
	}
	public static function get_product($data){
		$result = DB::table('products')->where('id',$data)->get();
		if(count($result)>0)
			return $result[0];
		else return null;	
	}
	public static function update_info($data,$id){
		DB::table('restaurants')->where('id', $id)->update([
			'lunch_start' => $data->input('lunch_start'),
			'lunch_end' => $data->input('lunch_end'),
			'dinner_start' => $data->input('dinner_start'),
			'dinner_end' => $data->input('dinner_end'),
			'discount' => $data->input('discount'),
			'deliver_time' => $data->input('deliver_time'),
			'deliver_fee' => $data->input('deliver_fee'),
			'min_order' => $data->input('min_order')
		]);
	}
	public static function unhide_product($data){
		DB::table('products')->where('id', $data)->update(['hidden' => "0"]);
	}
	public static function hide_product($data){
		DB::table('products')->where('id', $data)->update(['hidden' => "1"]);
	}
	public static function update_product($data, $id){
		DB::table('products')->where('id', $id)->update(['name' => $data->input('name'),'price' => $data->input('price'),'details' => $data->input('details')]);
	}
	public static function unavailable_product($data){
		DB::table('products')->where('id', $data)->update(['active' => "0"]);
	}
	public static function available_product($data){
		DB::table('products')->where('id', $data)->update(['active' => "1"]);
	}
}
