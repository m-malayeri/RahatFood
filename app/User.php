<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Foundation\Auth\User as Authenticatable;
use DB;

class User extends Authenticatable{
    use Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name', 'email', 'phone','password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password', 'remember_token',
    ];
	
	public static function update_user_info($id,$data){
		DB::table('users')->where('id', $id)->update(['name' => $data->input('name'),'phone' => $data->input('phone'),'address' => $data->input('address')]);
		return true;
	}
	public static function get_admin_total_users($data){
		$total_users = DB::table('users')->where('role_id',$data)->get();
		return $total_users;
	}
	public static function get_user_info_by_email($data){
		$result = DB::select('select name,phone,address from users where email = ?', array($data));
		if(count($result)>0)
			return $result[0];
	}
	public static function get_user_info($data){
		$result = DB::select('select name,phone,address from users where id = ?', array($data));
		if(count($result)>0)
			return $result[0];
	}
	public function isAdmin(){
		if($this->role_id==3)
			return true;
		return false;
	}
	public function isVendor(){
		if($this->role_id==2)
			return true;
		return false;
	}
}
