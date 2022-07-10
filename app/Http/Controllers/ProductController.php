<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Redirect;
use Auth;
use Carbon\Carbon;
use App\Http\Requests\Store_product;

// Models ------------------------------------------------- 
use App\areas;
use App\restaurants;
use App\orders;
use App\User;

class ProductController extends Controller{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(){
		if(Auth::check()){
			$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
			$products=restaurants::get_products($vendor->id);
			return view('vendor.products.index')->with(compact('products','vendor'));
		} else return Redirect::to('/home');
        
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(){
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Store_product $request){
        if(request()->file('product_pic')!=null)
			$picture=request()->file('product_pic')->store('public');
		else
			$picture="product-pic-default.jpg";
		$category_id=$request->input('category');
		switch($request->input('category')){
			case "irani":
				$category_title="غذای ایرانی";
				$category_order=0;
			break;
			case "pizza":
				$category_title="پیتزا";
				$category_order=5;
			break;
			case "sandwich":
				$category_title="ساندویچ";
				$category_order=10;
			break;
			case "farangi":
				$category_title="فرنگی";
				$category_order=15;
			break;
			case "drink":
				$category_title="نوشیدنی";
				$category_order=20;
			break;
		}
		$array =array(
			'vendor_id'=>$request->input('vendor_id'),
			'name'=>$request->input('name'),
			'price'=>$request->input('price'),
			'category_id'=>$category_id,
			'category_title'=>$category_title,
			'category_order'=>$category_order,
			'picture'=>$picture,
			'details'=>$request->input('details')
		);
		restaurants::save_product($array);
		return Redirect::to('/vendor/products')->withMessage('ثبت آیتم جدید با موفقیت انجام شد');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id){
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($product_id){
        $product=restaurants::get_product($product_id);
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		if($product!=null and $product->vendor_id==$vendor->id)
			return view('vendor.products.edit')->with('product',$product);
		else
			return Redirect::to('/vendor/products')->withError('این آیتم متعلق به واحد شما نیست');
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Store_product $request, $id){
        $product=restaurants::get_product($id);
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		if($product!=null and $product->vendor_id==$vendor->id){
			restaurants::update_product($request, $id);
			return Redirect::to('/vendor/products')->withMessage('به روزرسانی آیتم با موفقیت انجام شد');
		}
		else
			return Redirect::to('/vendor/products');
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function unhide($product_id){
		$product=restaurants::get_product($product_id);
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		if($product!=null and $product->vendor_id==$vendor->id){
			restaurants::unhide_product($product_id);
			return Redirect::to('/vendor/products')->withMessage('تغییر نمایش آیتم با موفقیت انجام شد');
		}
		else
			return Redirect::to('/vendor/products')->withError('این آیتم متعلق به واحد شما نیست');
    }
	public function hide($product_id){
		$product=restaurants::get_product($product_id);
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		if($product!=null and $product->vendor_id==$vendor->id){
			restaurants::hide_product($product_id);
			return Redirect::to('/vendor/products')->withMessage('تغییر نمایش آیتم با موفقیت انجام شد');
		}
		else
			return Redirect::to('/vendor/products')->withError('این آیتم متعلق به واحد شما نیست');
    }
	public function unavailable_product($product_id){
		$product=restaurants::get_product($product_id);
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		if($product!=null and $product->vendor_id==$vendor->id){
			restaurants::unavailable_product($product_id);
			return Redirect::to('/vendor/products')->withMessage('تغییر وضعیت آیتم با موفقیت انجام شد');
		}
		else
			return Redirect::to('/vendor/products')->withError('این آیتم متعلق به واحد شما نیست');
	}
	public function available_product($product_id){
		$product=restaurants::get_product($product_id);
		$vendor=restaurants::get_rest_details_by_manager(Auth::user()->email);
		if($product!=null and $product->vendor_id==$vendor->id){
			restaurants::available_product($product_id);
			return Redirect::to('/vendor/products')->withMessage('تغییر وضعیت آیتم با موفقیت انجام شد');
		}
		else
			return Redirect::to('/vendor/products')->withError('این آیتم متعلق به واحد شما نیست');
	}
}
