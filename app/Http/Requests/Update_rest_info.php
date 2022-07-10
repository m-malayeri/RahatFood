<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Update_rest_info extends FormRequest{
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
			'lunch_start' => 'required',
			'lunch_end' => 'required',
			'dinner_start' => 'required',
			'dinner_end' => 'required',
			'discount' => 'required|numeric|min:0|max:99',
			'deliver_time' => 'required',
			'deliver_fee' => 'required|numeric|min:0|max:110000',
			'min_order' => 'required|numeric|min:0',
		];
    }
	/**
	 * Get the error messages for the defined validation rules.
	 *
	 * @return array
	 */
	public function messages(){
		return [
			'discount.numeric' => 'تخفیف باید در قالب عددی وارد شود',
			'discount.max' => 'رعایت حداکثر تخفیف',
			'discount.min' => 'رعایت حداقل تخفیف',
			'deliver_fee.numeric'  => 'هزینه پیک باید در قالب عددی وارد شود',
			'deliver_fee.max'  => 'رعایت حداکثر هزینه پیک',
			'deliver_fee.min'  => 'رعایت حداقل هزینه پیک',
			'min_order.numeric'  => 'حداقل سفارش باید در قالب عددی وارد شود',
			'min_order.min'  => 'رعایت مقدار',
		];
	}
}
