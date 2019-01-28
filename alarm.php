<html>
<?php
	/*
	$curl = curl_init();
	$url = 'https://server.citypay.org.ua:9919/api/v1/account/byAcc';
	$data = array('account' => '2490092005');
	$port = 9919;
	curl_setopt($curl,CURLOPT_URL, $url);
	curl_setopt($curl,CURLOPT_RETURNTRANSFER,true);
	curl_setopt($ch, CURLOPT_NOBODY, true);
	curl_setopt($curl,CURLOPT_HEADER,1);
	curl_setopt($ch,CURLOPT_FAILONERROR,true);

	
	
	curl_setopt($curl,CURLOPT_POST,1);
	curl_setopt($curl,CURLOPT_POSTFIELDS, $data);
//	curl_setopt($curl,CURLOPT_USERAGENT,"User-Agent=Mozilla/5.0 Firefox/1.0.7");
	curl_setopt($curl,CURLOPT_SSL_VERIFYPEER,0);
	//curl_setopt($curl,CURLOPT_SSL_VERIFYHOST,1);
	
	curl_setopt($curl,CURLOPT_SSLCERT,'/www/wp-content/themes/neve/page-templates/cert/citypay.crt');
	curl_setopt($curl,CURLOPT_SSLKEY,'/www/wp-content/themes/neve/page-templates/cert/citypay.key');
	curl_setopt($curl,CURLOPT_CAPATH,'/www/wp-content/themes/neve/page-templates/cert/ca.crt');
//	curl_setopt($curl,CURLOPT_SSLCERTPASSWD,"");
//	curl_setopt($curl,CURLOPT_SSLKEYPASSWD,"123");
	
	$response = curl_exec($curl);
	echo $response;
	
	$err = curl_error($curl);
	//$err2 = curl_errno($curl);
	
	curl_close($curl);
	
	if ($err) {
		echo "cURL Error number-" . $err2 . " Data: " . $err;
	} else {
		echo $response;
	}*/
	

	$curl = curl_init();
	
	curl_setopt_array($curl, array(
								   CURLOPT_PORT => "9919",
								   CURLOPT_URL => "https://server.citypay.org.ua:9919/api/v1/account/byAcc",
								   CURLOPT_RETURNTRANSFER => true,
								   CURLOPT_ENCODING => "",
								   CURLOPT_MAXREDIRS => 10,
								   CURLOPT_TIMEOUT => 30,
								   CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
								   CURLOPT_CUSTOMREQUEST => "POST",
								   CURLOPT_POSTFIELDS => "{\n    \"account\": 2500875004,\n    \"provider_id\": 39\n}",
								   CURLOPT_SSL_VERIFYPEER=>1,
								   
								   CURLOPT_SSLCERT => "/www/wp-content/themes/neve/page-templates/cert/citypay.crt",
								   CURLOPT_SSLKEY =>"/www/wp-content/themes/neve/page-templates/cert/citypay.key",
								   
								   CURLOPT_CAPATH => "/www/wp-content/themes/neve/page-templates/cert/ca.crt",
								   
								   CURLOPT_HTTPHEADER => array(
															   "Content-Type: application/json",
															   "Postman-Token: a8445385-32b4-4f30-9837-2881e2ae18da",
															   "cache-control: no-cache"
															   ),
								   ));
	
	$response = curl_exec($curl);
	$err = curl_error($curl);
	
	echo $response;
	
	curl_close($curl);
	
	if ($err) {
		echo "cURL Error #:" . $err;
	} else {
		echo $response;
	}
?>
</html>
