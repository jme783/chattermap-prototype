
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
  var articleTitle= article['data']['title'];
  var article_html = "<div class='article'>";
  article_html += "<p class='article_title' href=" + "'http://www.reddit.com" + articleURL + "'>"+ articleTitle + "</p>";
  article_html += "</div>";
  //Get the comments of the reddit article, and only display if there are more than 30 comments
  redditArticleURL = "http://www.reddit.com" + articleURL + ".json?jsonp=?";

  $.getJSON(redditArticleURL, handleRequest1)
  function handleRequest1(dataComments) {
    var resultsCommunity = dataComments[0]['data']['children'][0]['data'];
    comments = resultsCommunity['num_comments'];
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
  currentURL = $(this).attr("href");
  //Pass the current URL of the article into the force layout to create Chattermap
  initiateForceJS(currentURL);
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
    .style("opacity", 0);
        
    function initiateForceJS(currentURL) {
        $('#chart').show();
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
         
         root.data.fixed = true;
         root.data.x = w/2;
         root.data.y = 30;
      // Restart the force layout.
      force
          .nodes(nodes)
          .links(links)
          .charge(-350)
          .gravity(0)
          .start();
    
      // Update the linksÉ
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
    
      // Update the nodesÉ
      node = vis.selectAll("circle.node")
          .data(nodes, function(d) {return d.id; })
          .style("fill", color);
    
      // Enter any new nodes.
      node.enter().append("svg:circle")
          .attr("class", "node")
          .attr("cx", function(d) {return d.x; })
          .attr("cy", function(d) {return d.y; })
          .attr("r", 10)
          .style("fill", color)
          //.on("click", click)
          .call(force.drag);
    
      // Exit any old nodes.
      node.exit().remove();
      //This will add the name of the character to the node
      
      node.append("comment").text(function(d) { return d.body });
      //This will put the comment in the Comment Area div
      node.on("mouseover", function() {
         currentNode = d3.select(this);
         currentTitle = currentNode.select("comment").text();
        div.transition()        
                .duration(200)      
                .style("opacity", .9);
        
        
        div .html(currentTitle)
                //Position the tooltip based on the position of the current node, and it's size
                .style("left", (currentNode.attr("cx") - (-currentNode.attr("r")) - (-9)) + "px")   
                .style("top", (currentNode.attr("cy") - 15)  + "px");    
      
      });
      node.on("mouseout", function(d) {       
            div.transition()        
                .duration(500)      
                .style("opacity", 0);
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
        var upvotes = d.ups;
        var downvotes = d.downs;
        var totalvotes = upvotes + downvotes;
        var percentagePositive = (upvotes/totalvotes)*100;
        
        if (percentagePositive >= 90 && percentagePositive <= 100) {
          return "#5c9928";
        }
        else if (percentagePositive >= 80 && percentagePositive < 90) {
          return "#69a12c";
        }
        else if (percentagePositive >= 70 && percentagePositive < 80) {
          return "#94bc3b";
        }
        else if (percentagePositive >= 60 && percentagePositive < 70) {
          return "#c3d74a";
        }
        else if (percentagePositive >= 50 && percentagePositive < 60) {
          return "#e1dc52";
        }
        else if (percentagePositive >= 40 && percentagePositive < 50) {
          return "#dcbd4c";
        }
        else if (percentagePositive >= 30 && percentagePositive < 40) {
          return "#c2823e";
        }
        else if (percentagePositive >= 20 && percentagePositive < 30) {
          return "#a6482f";
        }
        else {
          return "#992d28";
        }  
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
    
