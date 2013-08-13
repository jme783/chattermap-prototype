
//BEGIN Reddit API CODE

//Get Reddit's top articles from the news sub-reddit
var redditNewsURL = "http://www.reddit.com/r/news/top/.json?limit=10&sort=top&t=week&jsonp=?";
$.getJSON(redditNewsURL, handleRequest)


function handleRequest(data,callback) {
  var results = data['data']['children'];
  for (var i=0; i < results.length; i++) {
    displayArticle(results[i]);
  }
}

function displayArticle(article) {
  //Create the HTML for the returned article from Reddit
  var articleURL= article['data']['permalink'];
  var originalURL = article['data']['url'];
  var articleTitle= article['data']['title'];
  var numberOfComments = article['data']['num_comments'];
  var article_html = "<div class='article'>";

  article_html += "<p class='article_title' data-url='" + originalURL + "' data-num-comments='"+ numberOfComments +"' href=" + "'http://www.reddit.com" + articleURL + "'>"+ articleTitle + "</p>";
  article_html += "</div>";
  //Get the comments of the reddit article, and only display if there are more than 30 comments
  redditArticleURL = "http://www.reddit.com" + articleURL + ".json?jsonp=?";

  $.getJSON(redditArticleURL, handleRequest1)
  function handleRequest1(dataComments) {
    var resultsCommunity = dataComments[0]['data']['children'][0]['data'];
    //If the article has comments, add it to the page as a selection
    //if(comments >= 100) {
      $('#nytSection').append(article_html);
    //}
}

  

}



// Show the Reddit articles when clicking the initiate button
$('#chattermap-landing-frame span#kickin-it-off').click(function() {
    $('#chattermap-landing-frame').hide();
      $('#stories-loading').fadeIn("fast");
      setTimeout(function(){
        $('#stories-loading').fadeOut("fast");
        $('#nytSection').show();
      }, 4000);
      
});


//Pass the selected article to the Community API
$(document).on("click", ".article_title", function() {
  $('#nytSection').hide();
  var currentURL = $(this).attr("href");
  var originalURL = $(this).attr("data-url");
  var articleTitle = $(this).html();
  var numberOfComments = $(this).attr("data-num-comments"); 

  //Pass the current URL of the article into the force layout to create Chattermap
  initiateForceJS(currentURL, originalURL, articleTitle, numberOfComments);
});

    //Force Layout Code
    var w = 960,
        h = 900,
        node,
        link,
        root;
    
    var force = d3.layout.force()
        .on("tick", tick)
        .size([w, h]);
    
    var vis = d3.select("#chart").append("svg:svg")
        .attr("width", w)
        .attr("height", h);
    
    //Tooltip for the comment body
    var div = d3.select("#chart").append("div")   
    .attr("class", "tooltip")               
    .style("opacity", 1);


   
        
    function initiateForceJS(currentURL, originalURL, articleTitle, numberOfComments) {     
        $('#chart').show();
        $('#chart').before('<a class="original-article-link" target="_blank" href="' + originalURL +'">' + articleTitle + '</a><h4 class="number-of-comments">' + numberOfComments + ' Comments</h4>');
        //Generate the URL
        forceRedditURL = currentURL + ".json?jsonp=?";
        $('#commentArea').show();
        $.getJSON(forceRedditURL,handleRequest2);
        function handleRequest2(json) {
            //Set the root as the first comment returned by reddit
            root = json[1]['data']['children'][0];
            update();
        }
    }
    
    function update() {
         nodes = flatten(root),
         links = optimize(d3.layout.tree().links(nodes));
         avgNetPositive = getAvgNetPositive();
         maxNetPositive = d3.max(netPositiveArray);
         minNetPositive = d3.min(netPositiveArray);
         // Create a logarithmic scale that sizes the nodes
         radius = d3.scale.pow().exponent(.3).domain([minNetPositive,maxNetPositive]).range([5,30]);
         root.data.fixed = true;
         root.data.x = w/2;
         root.data.y = 50;
      // Restart the force layout.
      force
          .nodes(nodes)
          .links(links)
          .charge(-250)
          .gravity(0)
          .start();
      

      

      
      // Update the links
      link = vis.selectAll("line.link")
          .data(links, function(d) { return d.target.id; });
    
      // Enter any new links.
      link.enter().insert("svg:line", ".node")
          .attr("class", "link")
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    
      // Exit any old links.
      link.exit().remove();
    
      // Update the nodes
      node = vis.selectAll("circle.node")
          .data(nodes, function(d) {return d.id; })
          .style("fill", color);
    
      // Enter any new nodes.
      node.enter().append("svg:circle")
          .attr("class", "node")
          .attr("cx", function(d) {return d.x; })
          .attr("cy", function(d) {return d.y; })
          .attr("r", sizeNodes)
          .attr("opacity",function(d) {
            var thisNode = d3.select(this);
            var thisRadius = thisNode[0][0]["r"]["animVal"]["value"];
            if (thisRadius <= 10) {
              
              return 0.3;

            } else if (thisRadius <= 15) {

              return 0.5;
            
            } else if (thisRadius <= 20) {

              return 0.6;

            } else if (thisRadius <= 25) {

              return 0.8;

            } else {

              return 0.9;

            }
          })
          .style("fill", color)
          //.on("click", click)
          .call(force.drag);
    
      // Exit any old nodes.
      node.exit().remove();
      //This will add the name of the character to the node
      
      node.append("comment").text(function(d) { return d.body });
      //This will put the comment in the Comment Area div

       //On load, assign the root node to the tooltip
       numberOfNodes = node[0].length;
       rootNode = d3.select(node[0][parseInt(numberOfNodes) - 1]);
       rootNodeComment = rootNode.select("comment").text()

       div .html(rootNodeComment)
               //Position the tooltip based on the position of the current node, and it's size
                .style("left", (rootNode.attr("cx") - (-rootNode.attr("r")) - (-9)) + "px")   
                .style("top", (rootNode.attr("cy") - 15)  + "px");    
      //div.html()
      node.on("mouseover", function() {
         currentNode = d3.select(this);
         currentTitle = currentNode.select("comment").text();
        div.transition()        
                .duration(200)      
                .style("opacity", 1);
        
        
        div .html(currentTitle)
                //Position the tooltip based on the position of the current node, and it's size
                .style("left", (currentNode.attr("cx") - (-currentNode.attr("r")) - (-9)) + "px")   
                .style("top", (currentNode.attr("cy") - 15)  + "px");    
      
      });
      node.on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 1);
      });
    } 
    
    function tick(e) {
  


       var kx = .4 * e.alpha, ky = 1.4 * e.alpha;
       links.forEach(function(d, i) {
          d.target.x += (d.source.x - d.target.x) * kx;
          d.target.y += (d.source.y + 80 - d.target.y) * ky;
      });
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
    
      node.attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
      
    }
    
    // Color leaf nodes orange, and packages white or blue.
    function color(d) {
        return '#2960b5'
    }

    function sizeNodes(d) {
      //Get the net positive reaction
      var netPositive = d.ups - d.downs;
      var relativePositivity = netPositive/avgNetPositive;
      //Scale the radii based on the logarithmic scale defined earlier
      return radius(netPositive);
      
    }
    
    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      //update();
    }

    // Returns a list of all nodes under the root.
    function flatten(root) {
      var nodes = [], i = 0, j = 0;
      function recurse(node) {
        
        if (node['data']['replies'] != "" && node['kind'] != "more") {
            node['data']['replies']['data']['children'].forEach(recurse);
        }
        if (node['kind'] !="more") {
            //Add an ID value to the node starting at 1
            node.data.id = ++i;
            node.data.name = node.data.body;
            //Put the replies in the key 'children' to work with the tree layout
            if (node.data.replies != "") {
                  
                 node.data.children = node.data.replies.data.children;
                 //Remove the extra 'data' layer for each child
                 for (j=0; j < node.data.children.length; j++) {
                    node.data.children[j] = node.data.children[j].data;
                 }
                 
            } else {
                node.data.children = "";
            }
            var comment = node.data;
            nodes.push(comment);
        }
      }
      recurse(root);
      return nodes;  
    }
    
    function optimize(linkArray) {
        optimizedArray = [];
        for (k=0; k < linkArray.length; k++) {
            if(typeof linkArray[k].target.count == 'undefined') {
                optimizedArray.push(linkArray[k]);
            }
            else {
              
            }
        }
        return optimizedArray;
    
    }

    function getAvgNetPositive() {
      var sum = 0;
      netPositiveArray = []
      //Select all the nodes
      var allNodes = d3.selectAll(nodes)[0];
      //For each node, get the net positive votes and add it to the sum
      for (i=0; i < allNodes.length; i++) {
        var netPositiveEach = allNodes[i]["ups"] - allNodes[i]["downs"];
        sum += netPositiveEach;
        netPositiveArray.push(netPositiveEach);
      }
      var avgNetPositive = sum/allNodes.length;
      return avgNetPositive;

    }

   
    
