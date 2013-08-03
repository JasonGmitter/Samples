<?php

/*
 * Script Creator:  	Jason Gmitter
 * Version:			1.0
 * Script Description:	Generates a main rss file for combining child rss feeds.
 */


/* Globals */
$site_title = 'Ranch Story Combined RSS Feeds';
$site_url  = 'http://www.ranchstory.co.uk';
$site_desc = 'Get your latest Harvest Moon information and updates here!';

$rss_feedlist   = 'rss_list.txt';
$rss_cache = 'ranchstory_com_rss.xml';

$xml_encoding = 'UTF-8';
$num_items    = '5';

$version = '1.0';


$rss = new RS_RSS();
unset($rss);

/* Main Script */

class RS_RSS
{
    /* Init */
    function __construct()
    {
        global $rss_cache;
        
        // If it's current, don't make a new one
        $current = $this->checkCache();
        if ($current) {
            header('Location: ./' . $rss_cache);
            exit;
        } else {
            $this->gatherNews();
        }
    }
    
    /* Check how recent cache is */
    function checkCache()
    {
        global $rss_cache;
        
        // Does they exits? If not, return nothing
        if (file_exists($rss_cache) && strlen(file_get_contents($rss_cache)) > 0) {
            $date_diff = @(time() - filemtime($rss_cache));
            if ($date_diff < 1000) {
                $status = true;
            } else {
                $status = false;
            }
        } else {
            $status = false;
        }
        return $status;
    }
    
    /* Get items from multiple RSS feeds from around the site */
    function gatherNews()
    {
        global $rss_feedlist, $num_items;
        
        // Read in $rss_feedlist and create an array of contents
        $rss_urls  = file($rss_feedlist);
        $rss_nodes = array();
        
        foreach ($rss_urls as $rss_url) {
            // read the XML file
            $xml = simplexml_load_file($rss_url, null, false);
            if ($xml) {
                // Fetch the first # elements
                $max = min(count($xml->channel->item), $num_items);
                for ($i = 0; $i < $max; $i++) {
                    $v               = $xml->channel->item[$i];
                    // Create child arrays
                    $new['title']       = $v->title;
                    $new['link']        = $v->link;
                    $new['description'] = $v->description;
                    $new['pubDate']     = $v->pubDate;
                    $new['guid']        = $v->guid;
                    $new['date']        = strtotime($v->pubDate);
                    // Append array
                    array_push($rss_nodes, $new);
                }
            }
        }
        // Sort according to date
        usort($rss_nodes, array(
            &$this,
            'sortByDate'
        ));
        $this->outputXML($rss_nodes);
    }
    
    function sortByDate($a, $b)
    {
        if ($a['date'] == $b['date']) {
            return 0;
        } elseif ($a['date'] > $b['date']) {
            return -1;
        } else {
            return 1;
        }
    }
    
    /* Compile into one */
    function outputXML($rss_nodes)
    {
        global $site_title, $site_url, $site_desc, $xml_encoding, $rss_cache;
        
        $output_rss = '<?xml version="1.0" encoding="' . $xml_encoding . '"?>' . "\n";
        $output_rss .= '<rss version="2.0">' . "\n";
        $output_rss .= '<channel>' . "\n";
        $output_rss .= '<title>' . $site_title . '</title>' . "\n";
        $output_rss .= '<link>' . $site_url . '</link>' . "\n";
        $output_rss .= '<description>' . $site_desc . '</description>' . "\n";
        $output_rss .= '<pubDate>' . date(DATE_RFC822) . '</pubDate>' . "\n";
        $output_rss .= '<language>en</language>' . "\n";
        
        foreach ($rss_nodes as $v) {
            $output_rss .= '<item>' . "\n";
            $output_rss .= '<title>' . $v['title'] . '</title>' . "\n";
            $output_rss .= '<link>' . $v['link'] . '</link>' . "\n";
            $output_rss .= '<description><![CDATA[' . $v['description'] . ']]></description>' . "\n";
            $output_rss .= '<pubDate>' . $v['pubDate'] . '</pubDate>' . "\n";
            $output_rss .= '</item>' . "\n\n";
        }
        $output_rss .= "\t" . '</channel>' . "\n";
        $output_rss .= '</rss>';
        
        // We're done! Make file now
        file_put_contents($rss_cache, $output_rss, LOCK_EX);
        
        echo $output_rss;
    }
    
}

?>
