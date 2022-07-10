<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use DB;
use PDO;

class areas extends \Eloquent{
    protected $guarded = array();
    protected $table = 'areas'; // table name
    public $timestamps = 'false' ; // to disable default timestamp fields
    
	public static function show_nearby_units($data){
		$result = DB::table('areas')->where('area_id',$data)->get();
		if(count($result)>0)
			return $result;
    }
	public static function get_area_info($data){
		$result = DB::table('area_info')->where('id',$data)->get();
		if(count($result)>0)
			return $result[0];
	}
	public static function get_all(){
		$result = DB::table('area_info')->get();
		if(count($result)>0)
			return $result;
	}
	public static function save_restaurant_coverage($data){
		DB::table('areas')->insert($data);
	}
	public static function get_admin_total_areas(){
		$result = DB::table('area_info')->get();
		return $result;
	}
	public static function search_area($data){
		$result = DB::table('area_info')->where('name','like',"%".$data."%")->get();
		if(count($result)>0)
			return $result[0];
		else
			return null;
	}
}
