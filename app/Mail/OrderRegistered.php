<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class OrderRegistered extends Mailable{
    use Queueable, SerializesModels;

	public $order;
	public $basket_id;
	public $vendor;

    public function __construct($order,$basket_id,$vendor){
		$this->order = $order;
		$this->basket_id = $basket_id;
		$this->vendor = $vendor;
    }
    public function build(){
		return $this->from('rahatfood@outlook.com')->view('registered_plain')->bcc('azizmalayeri@outlook.com');
    }
}
