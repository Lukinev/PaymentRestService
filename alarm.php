<html>
<?php
	
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
