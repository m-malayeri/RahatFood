<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Redirect;
use Auth;
use Carbon\Carbon;
use Mail;
use Log;
use SoapClient;

// Mailable & Form Request --------------------------------
use App\Mail\OrderRegistered;
use App\Http\Requests\Store_order;
use App\Http\Requests\Update_user_info;

// Models ------------------------------------------------- 
use App\areas;
use App\restaurants;
use App\orders;
use App\User;

class UserController extends Controller{
	public function search_location(Request $request){
		$vendors=restaurants::get_admin_total_restaurants();
		$i=0;$n=0;
		$restaurants=array();
		foreach($vendors as $vendor){
			$user_lat=$request->input('lat');
			$user_long=$request->input('long');
			$distance=$this->get_dist($user_lat,$user_long,$vendor->latitude,$vendor->longitude);
			if($distance < $vendor->cover_dist){
				$restaurants[$i]=$vendor->id;
				$n++;
			}
			$i++;
		}
		$restaurants=restaurants::get_rests_details($restaurants);
		$area=areas::get_area_info("Buali");
		$area->name="محل فعلی کاربر";
		$area->id="geo";
		$area->cover="public/geo.jpg";
		return view('area')->with(compact('restaurants','area'));
	}
	public function get_dist($latitude1, $longitude1, $latitude2, $longitude2) {
		$theta = $longitude1 - $longitude2;
		$distance = sin(deg2rad($latitude1)) * sin(deg2rad($latitude2))+(cos(deg2rad($latitude1)) * cos(deg2rad($latitude2)) * cos(deg2rad($theta)));
		$distance = acos($distance); $distance = rad2deg($distance); 
		$distance = $distance * 60 * 1.1515;
		$distance = $distance * 1.609344; 
		return (round($distance,2)); 
	}
	public function show_nearby_units($area_id,$area_name){
		$result=areas::show_nearby_units($area_id);
		$area=areas::get_area_info($area_id);
		if($result!=null){
			$i=0;
			foreach($result as $loc){
				$restaurants[$i]=$loc->restaurant_id;
				$i++;
			}
			$restaurants=restaurants::get_rests_details($restaurants);
			return view('area')->with(compact('restaurants','area')); 
		}
		else return Redirect::to('/home')->withMessage('متاسفانه این منطقه فعلاً تحت پوشش خدمات راحت فود نیست');
	}
	public function update_user_info(Update_user_info $request){
		$result=User::update_user_info(Auth::id(),$request);
		if($result!=null) return Redirect::to('panel')->withMessage('به روزرسانی اطلاعات کاربری با موفقیت انجام شد');
	}
	public function show_restaurant($area_id,$restaurant_id,$restaurant_name){
		$restaurant=restaurants::get_rest_details($restaurant_id);
		$area=areas::get_area_info($area_id);
		$products=restaurants::get_products($restaurant_id);
		if(count($restaurant)==0 or count($area)==0) return Redirect::to('home')->withMessage('اطلاعات واحد یا منطقه مورد نظر در دسترس نیست');
		if(count($products)==0) return view('restaurant')->with(compact('restaurant','area'));
		return view('restaurant')->with(compact('products','restaurant','area'));
	}
	public function show_cart(Request $request){
		if(!empty($request->input('vendor_id'))){
			$vendor=restaurants::get_rest_details($request->input('vendor_id'));
			$cart=session()->get('shopping_cart_'.$request->input('vendor_id'));
			if(count($cart)>0 and count($vendor)>0)
				return view('cart')->with(compact('cart','vendor'));
			else return Redirect::to('/home');
		}
		else return Redirect::to('/home');
	}
	public function payment(Request $request){
		$order_id=$request->input('order_id');
		$order_amount=($request->input('order_amount')/10);
		$parameters= array (
			'api_key'=> 'f95dca58-d89f-4a3e-a391-16b22942e48f',
			'order_id'=> $order_id,
			'amount'=> $order_amount,
			'callback_uri'=> "http://www.rahatfood.com/callback"  
		);
		$client = new SoapClient('http://api.nextpay.org/gateway/token.wsdl');
		$token_obj = $client->TokenGenerator($parameters);
		$trans_id=$token_obj->TokenGeneratorResult->trans_id;
		$code=$token_obj->TokenGeneratorResult->code;
		if($code=="-1"){
			orders::update_order_trans($order_id,$trans_id);
			$bank_url="http://api.nextpay.org/gateway/payment/".$trans_id;
			echo $bank_url;
			return Redirect::to($bank_url);
		}
	}
	public function callback(Request $request){
		$trans_id=$request->input('trans_id');
		$order_id=$request->input('order_id');
		$status=orders::validate_trans_id($order_id,$trans_id);
		$order=orders::get_order_details($order_id);
		$order_amount=(($order->cart_total)/10);
		if($status==true){
			$parameters= array (
				'api_key'=> 'f95dca58-d89f-4a3e-a391-16b22942e48f',
				'order_id'=> $order_id,
				'amount'=> $order_amount,
				'trans_id'=> $trans_id
			);
			$client = new SoapClient('http://api.nextpay.org/gateway/verify.wsdl');
			$verify_obj = $client->PaymentVerification($parameters);
			$code=$verify_obj->PaymentVerificationResult->code;
			if($code==0){
				orders::update_order_status($order_id);
				return Redirect::to('panel')->withMessage('تراکنش با موفقیت صورت گرفت و وضعیت سفارش بروزرسانی گردید.');
			}
			else return Redirect::to('panel')->withErrors('تراکنش ناموفق');
		}else return Redirect::to('panel')->withErrors('اطلاعات تراکنش اشتباه است');
	}
	public function store_user_order(Request $request){
        Log::info("store user order start");
		$cart_total=0;
		$VAT=0;
		$discount=0;
		$vendor=restaurants::get_rest_details($request->input('vendor_id'));
		$cart=session()->get('shopping_cart_'.$request->input('vendor_id'));
		if(count($cart)>0 and count($vendor)>0){
			foreach($cart as $r)
				$cart_total+=($r["quantity"]*$r["price"]);
			if($vendor->VAT==true)
				$VAT=($cart_total*9)/100;
			if($vendor->discount >0)
				$discount=($cart_total * $vendor->discount)/100;
			$after_cart_total=($cart_total + $VAT) - $discount;
			if($request->input('payment_method')=="cash") $status=1; else $status=0;
			if($request->input('address')=="current_addr") $address=Auth::user()->address;
			else $address=$request->input('user_address');
			
			if($address==null)
				return Redirect::to(url()->previous())->withErrors('وارد کردن آدرس ضروری است');
			$array =array(
				'customer_id'=>Auth::id(),
				'vendor_id'=>$vendor->id,
				'cart_total'=>$after_cart_total,
				'payment_method'=>$request->input('payment_method'),
				'order_date'=>Carbon::now()->toDateString(),
				'order_time'=>Carbon::now()->toTimeString(),
				'customer_name'=>Auth::user()->name,
				'customer_phone'=>Auth::user()->phone,
				'customer_address'=>$address,
				'comment'=>$request->input('comment'),
				'status'=>$status
			);
			$email=Auth::user()->email;
			$last=orders::save_order($array);
			foreach($cart as $r){
				$array2 =array(
					'basket_id'=>$last,
					'product_id'=>$r["id"],
					'name'=>$r["name"],
					'quantity'=>$r["quantity"],
					'price'=>$r["price"],
				);
				orders::save_basket($array2);
			}
			session()->forget('shopping_cart_'.$request->input('vendor_id'));
			$vendor=restaurants::get_rest_details($array["vendor_id"]);
			$manager=User::get_user_info_by_email($vendor->manager);
			$vendor_phone=$manager->phone;
			$phone=$this->f2e($array["customer_phone"]);
			
			//$this->sms_soap($phone,$last,"init");
			//$this->sms_soap("09367005680",$last,"manager");
			//$this->sms_soap($vendor_phone,$last,"vendor");
			
			//Mail::to($email)->queue(new OrderRegistered($array,$last,$vendor));
			
			Log::info("store user order finish");
			if($request->input('payment_method')=="cash")
				return Redirect::to('panel')->withMessage('ثبت نهایی سفارش با موفقیت انجام شد، به زودی پیامک تایید به شما ارسال خواهد شد. (پرداخت پس از تحویل درب منزل)');
			elseif($request->input('payment_method')=="online")
				return Redirect::to('panel')->withMessage('ثبت ابتدایی سفارش با موفقیت انجام شد، جهت ثبت نهایی، فاکتور خود را به صورت آنلاین از طریق فرم زیر پرداخت کنید');
		}
	}
	public function store_guest_order(Store_order $request){
		Log::info("store guest order start");
		$cart_total=0;
		$VAT=0;
		$discount=0;
		$vendor=restaurants::get_rest_details($request->input('vendor_id'));
		$cart=session()->get('shopping_cart_'.$request->input('vendor_id'));
		if(count($cart)>0 and count($vendor)>0){
			foreach($cart as $r)
				$cart_total+=($r["quantity"]*$r["price"]);
			if($vendor->VAT==true)
				$VAT=($cart_total*9)/100;
			if($vendor->discount >0)
				$discount=($cart_total * $vendor->discount)/100;
			$after_cart_total=($cart_total + $VAT) - $discount;
			if($request->input('payment_method')=="cash") $status=1; else $status=0;
			$address=$request->input('user_address');
			$array =array(
				'customer_id'=>0,
				'vendor_id'=>$vendor->id,
				'cart_total'=>$after_cart_total,
				'payment_method'=>$request->input('payment_method'),
				'order_date'=>Carbon::now()->toDateString(),
				'order_time'=>Carbon::now()->toTimeString(),
				'customer_name'=>$request->input('name'),
				'customer_phone'=>$request->input('phone'),
				'customer_address'=>$request->input('user_address'),
				'comment'=>$request->input('comment'),
				'status'=>$status
			);
			$email=$request->input('email');
			$last=orders::save_order($array);
			foreach($cart as $r){
				$array2 =array(
					'basket_id'=>$last,
					'product_id'=>$r["id"],
					'name'=>$r["name"],
					'quantity'=>$r["quantity"],
					'price'=>$r["price"],
				);
				orders::save_basket($array2);
			}
			session()->forget('shopping_cart_'.$request->input('vendor_id'));
			$vendor=restaurants::get_rest_details($array["vendor_id"]);
			$manager=User::get_user_info_by_email($vendor->manager);
			$vendor_phone=$manager->phone;
			$phone=$this->f2e($array["customer_phone"]);
			
			//$this->sms_soap($phone,$last,"init");
			//$this->sms_soap("09367005680",$last,"manager");
			//$this->sms_soap($vendor_phone,$last,"vendor");
			
			//Mail::to($email)->queue(new OrderRegistered($array,$last,$vendor));
			
			Log::info("store guest order finish");
			return Redirect::to('/guest_order/done')->with(compact('last','array'));
		}
	}
	public function sms_soap($customer_phone,$track,$mode){
		ini_set("soap.wsdl_cache_enabled", "0");
		$sms_client = new SoapClient('http://87.107.121.54/post/send.asmx?wsdl', array('encoding'=>'UTF-8'));
		$parameters['username'] = "mr.aziz70";
		$parameters['password'] = "2289";
		$parameters['from'] = "30007002700300";
		$parameters['to'] = $customer_phone;
		$parameters['isflash'] =false;
		switch($mode){
			case "init":
				$parameters['text'] ="راحت فود- سفارش با موفقیت ثبت شد- کد رهگیری: ".$track;
				break;
			case "manager":
				$parameters['text'] ="سفارش جدید در راحت فود ثبت شد- کد رهگیری: ".$track;
				break;
			case "vendor":
				$parameters['text'] ="راحت فود- مدیر محترم، یک سفارش جدید ثبت شده است، لطفا بررسی نمایید. کد رهگیری: ".$track;
				break;
		}
		
		$sms_client->SendSimpleSMS2($parameters);
	}
	public function show_guest_page(Request $request){
		$order=session()->get('array');
		$basket_id=session()->get('last');
		if(count($order)>0){
			$vendor=restaurants::get_rest_details($order["vendor_id"]);
			return view('guest_page')->with(compact('order','vendor','basket_id'));
		}
		else return Redirect::to('/home');
	}
	public function show_panel(){
		$i=0;
		$n=0;
		$baskets=array(array());
		$rest_details=array();
		$user=User::get_user_info(Auth::id());		
		$orders=orders::get_user_orders(Auth::id());

		foreach($orders as $order){
			$restaurants[$n]=restaurants::get_rest_details($order->vendor_id);
			$basket=orders::get_basket($order->basket_id);
			foreach($basket as $c){
				$baskets[$n][$i]=$c;
				$i++;
			}
			$n++;
		}
		return view('panel')->with(compact('orders','baskets','restaurants','user'));
	}
	public function ajax_action(Request $request){
		$action=$request->input('action');
		$vendor_id=$request->input('vendor_id');
		$vendor=restaurants::get_rest_details($request->input('vendor_id'));
		if($vendor->status==true and $vendor->active==true){
			switch($action){
				case "add":
					$product=restaurants::get_product($request->input('id'));
					$array =array(
						'id'=>$product->id,
						'name'=>$product->name,
						'quantity'=>1,
						'price'=>$product->price
					);
					$ses=session()->get('shopping_cart_'.$vendor_id);
					$exist=$this->exist($array["id"],$vendor_id);
					if($exist===null)
						session()->push('shopping_cart_'.$vendor_id,$array);
					else{
						$ses[$exist]["quantity"]+=1;
						session()->forget('shopping_cart_'.$vendor_id);		
						foreach($ses as $r)
							session()->push('shopping_cart_'.$vendor_id, $r);
					}			
				break;
				case "remove":
					$id=$request->input('id');
					$ses=session()->get('shopping_cart_'.$vendor_id);
					$i=0;
					foreach($ses as $r) {
						if($id==$r['id'])
							unset($ses[$i]);
						$i++;
					}
					session()->forget('shopping_cart_'.$vendor_id);		
					foreach($ses as $r)
						session()->push('shopping_cart_'.$vendor_id, $r);
				break;
				case "empty":
					session()->forget('shopping_cart_'.$vendor_id);
				break;		
			}
			return view('little-cart')->with('vendor',$vendor);
		}
		else{
			echo "
			<div class='cart-empty'>
				<i class='icon-exclamation'></i><br>
				خارج از ساعت سفارش
			</div>";
		}
	}
	public function exist($id,$vendor_id){
		$ses=session()->get('shopping_cart_'.$vendor_id);
		if(!empty($ses)){
			$i=0;
			foreach($ses as $cart_item){
				if($id==$cart_item['id'])
					return $i;
				$i++;
			}
		}
		else return null;
		return null;
	}
	public function search_area(Request $request){
		$area=areas::search_area($request->input('q'));
		if($area!=null)
			return Redirect::to('/area/'.$area->id.'/'.$area->name);
		else
			return Redirect::to('/home')->withMessage('اطلاعات منطقه مورد نظر در دسترس نیست');
	}
	public function f2e($string){
		$en_num = array('0','1','2','3','4','5','6','7','8','9');
		$fa_num = array('٠','١','٢','٣','٤','٥','٦','٧','٨','٩');
		return str_replace($fa_num, $en_num, $string);
	}
}