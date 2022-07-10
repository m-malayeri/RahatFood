<?php
	function number2farsi2($string){
		$en_num = array("0" ,"1" ,"2" ,"3" ,"4" ,"5" ,"6" ,"7" ,"8" ,"9" );
		$fa_num = array("۰","۱","۲","۳","۴","۵","۶","۷","۸","۹");
		return str_replace($en_num, $fa_num, $string);
	}
?>

@extends('layouts.internal')
@section('title', 'test')
@section('content')
	<form action="{{url('/callback')}}" method="post">
		{{ csrf_field() }}
		<input type="text" name="trans_id" placeholder="trans_id"/>
		<input type="text" name="order_id" placeholder="order_id"/>
		<input type="submit" value="go!"/>
	</form>
@endsection