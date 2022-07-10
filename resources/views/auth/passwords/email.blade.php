@extends('layouts.auth')
@section('title', 'بازنشانی رمزعبور')

@section('seo')
	<meta name="description" content="بازنشانی رمز عبور در راحت فود">
@endsection

@section('content')
	<h4 style="color:#7f8c8d;">بازنشانی رمزعبور</h4>
	<form action="{{url('/password/email')}}" method="post" class="auth-form">
		{{ csrf_field() }}
		<div class="form-group {{ $errors->has('email') ? ' has-error' : '' }}">
			<input type="text" name="email" class="form-control input-lg {{ $errors->has('email') ? ' has-error' : '' }}" placeholder="ایمیل" required value="{{old('email')}}"/>
			@if ($errors->has('email'))
				<div class="auth-notifier">{{ $errors->first('email') }}</div>
			@endif	
		</div>
		<input type="submit" class="btn btn-lg btn-success" value="ارسال لینک بازنشانی رمز" />
	</form>
	<br>
	<h6>توجه: لینک بازنشانی رمز عبور، به آدرس ایمیل شما ارسال خواهد شد</h6>
	@if (session('status'))
		<div style="padding:25px;">
			<div class="alert alert-success well-sm">
				{{ session('status') }}
			</div>
		</div>
	@endif
@endsection