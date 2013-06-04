//BEGIN Reddit API CODE


//Get Reddit's top articles from the news sub-reddit
var redditNewsURL = "http://www.reddit.com/r/news/top/.json?limit=20&sort=top&t=week&jsonp=?";
$.getJSON(redditNewsURL, handleRequest);

function handleRequest(data) {
  var results = data['data']['children'];
  for (var i=0; i < results.length; i++) {
    displayArticle(results[i]);
  }
}

function displayArticle(article) {
  //Create the HTML for the returned article from Reddit
  var articleURL= article['data']['permalink'];
  var articleTitle= article['data']['title'];
  var article_html = "<div class='article'>";
  article_html += "<p class='article_title' href=" + "'http://www.reddit.com" + articleURL + "'>"+ articleTitle + "</p>";
  article_html += "</div>";
  //Get the comments of the reddit article, and only display if there are more than 30 comments
  redditArticleURL = "http://www.reddit.com" + articleURL + ".json?jsonp=?";

  $.getJSON(redditArticleURL, handleRequest1);
  function handleRequest1(dataComments) {
    var resultsCommunity = dataComments[0]['data']['children'][0]['data'];
    comments = resultsCommunity['num_comments'];
    //If the article has comments, add it to the page as a selection
    if(comments >= 100) {
      $('#nytSection').append(article_html);
    }
}
  
}

//Pass the selected article to the Community API
$(document).on("click", ".article_title", function() {
  $('#nytSection').hide();
  currentURL = $(this).attr("href");
  //Pass the current URL of the article into the force layout to create Chattermap
  initiateForceJS(currentURL);
});

//END OF NYT API CODE

// BEGIN FORCE JS CODE
var node,
    root;
function initiateForceJS(currentURL) {
  //Generate the URL
  forceRedditURL = currentURL + ".json?jsonp=?";
  
$('#commentArea').show();
//The height and width of the SVG, as well as the size of the circle nodes
var width = 607,
    height = 500;
    r = 15;

//Initializes the force layout object
var force = d3.layout.force()
    //The factor of repulsion between each node
    .charge(-400)
    //How long each link is between nodes
    .linkDistance(40)
    .friction(.5)
    //Strength of central force of gravity
    .gravity(.2)
    .size([width, height]);

//Adds the svg object ot the document body with a predetermined height and width
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Reads data from the JSON URL and connects them to the nodes and links
$.getJSON(forceRedditURL,handleRequest2);
  function handleRequest2(graph) {
  root = graph[1]['data']['children']; 
  //console.log(root);
  var nodes = flatten(root);
  //var links = d3.layout.tree().links(nodes)
  //console.log(links)
  force
      .nodes(nodes)
      //.links(links)
      .start();

  /*var link = svg.selectAll("line.link")
    .data(links, function(d) { return d.target.id;})
    .enter().append("line")
      .attr("class", "link")
      .style("stroke-width", function(d) { return Math.sqrt(d.value); });*/

  node = svg.selectAll("circle.node")
    .data(nodes)
    .enter().append("circle")
      .attr("class", "node")
      .attr("r", 15)
      .style("fill", "#2A549D")
      .call(force.drag);
      
      
    //This will add the name of the character to the node
    //node.append("name").text(function(d) { return d['data']['body'] });
    //This will put
   node.on("mouseover", function() {
        var currentNode = d3.select(this);
        var currentTitle = currentNode.select("name").text();
        $('#commentArea').html('<p>' + currentTitle + '</p>')   
    
    });
    

  force.on("tick", function() {
    node.attr("cx", function(d) { return d.x = Math.max(r, Math.min(width - r, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(r, Math.min(height - r, d.y)); });
    
    /*link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });*/
  });
}

}

// Returns a list of all nodes under the root.
function flatten(root) {
  var nodes = [], i = 0;

  function recurse(root) {
    node = root[i]['data'];

    for (var i=0; i < root.length; i++) {
      console.log(node);
    }
    //recurse(node);
    
    //recurse(node[0]);
    //if (node[i]['data']['replies']['data']['children']) node[i]['data']['replies']['data']['children'].forEach(recurse);
    //if (!node.id) node.id = ++i;
    //nodes.push(node);
  }

  recurse(root);
  return nodes;
}
//END OF FORCE JS CODE

//BEGIN NYT API CODE */



