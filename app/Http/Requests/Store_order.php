<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Store_order extends FormRequest{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize(){
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules(){
		return [
			'name' => 'required',
			'email' => 'email',
			'phone' => 'required|size:11',
			'user_address' => 'required',
		];
    }
	/**
	 * Get the error messages for the defined validation rules.
	 *
	 * @return array
	 */
	public function messages(){
		return [
			'email.email' => 'آدرس ایمیل خود را به درستی وارد نمایید',
			'phone.size'  => 'شماره تلفن همراه خود را به درستی وارد نمایید',
			'name.required'  => 'وارد کردن نام و نام خانوادگی ضروری است',
			'phone.required'  => 'وارد کردن شماره تلفن همراه ضروری است',
			'user_address.required'  => 'وارد کردن آدرس ضروری است',
		];
	}
}
