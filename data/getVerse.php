<?php
	header('Content-Type: application/json');
	$url = 'https://biblegateway.com/votd/get/?format=json&version=NIV';
	$result = file_get_contents($url);
	print json_encode($result, JSON_PRETTY_PRINT);
	
	/*
	header('Content-Type: application/json');
	$url = 'https://biblegateway.com/votd/get/?format=json&version=NIV';
	$result = file_get_contents($url);
	
	//echo $result;
	// Will dump a beauty json :3
	$votd = html_entity_decode($result);
	$myArray = json_decode($votd, true);
	
	$verse = $myArray['votd']['reference'];
	//echo $verse;
	$url2 = 'https://query.getbible.net/v2/kjv/'.$verse;
	$result2 = file_get_contents($url2);
	print json_encode($result2, JSON_PRETTY_PRINT);
	*/
?>