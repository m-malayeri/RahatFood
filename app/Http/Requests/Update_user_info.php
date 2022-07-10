<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Update_user_info extends FormRequest{
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
			'phone' => 'required|numeric|digits:11',
			'address' => 'required'
		];
    }
	/**
	 * Get the error messages for the defined validation rules.
	 *
	 * @return array
	 */
	public function messages(){
		return [
			'name.required' => 'وارد کردن نام و نام خانوادگی ضروری است',
			'phone.required'  => 'وارد کردن شماره تلفن همراه ضروری است',
			'phone.numeric'  => 'شماره تلفن همراه باید در قالب عددی وارد شود',
			'phone.digits'  => 'تعداد ارقام شماره تلفن همراه باید 11 رقم باشد',
			'address.required'  => 'وارد کردن آدرس ضروری است',
		];
	}
}
