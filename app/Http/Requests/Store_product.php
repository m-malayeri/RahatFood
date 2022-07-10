<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Store_product extends FormRequest{
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
			'price' => 'required|numeric|max:1000000'
		];
    }
	/**
	 * Get the error messages for the defined validation rules.
	 *
	 * @return array
	 */
	public function messages(){
		return [
			'name.required' => 'وارد کردن نام محصول ضروری است',
			'price.required'  => 'وارد کردن قیمت محصول ضروری است',
			'price.numeric'  => 'قیمت محصول باید به صورت عددی وارد شود',
			'price.max'  => 'قیمت وارد شده بالاتر از حد مجاز است',
		];
	}
}
