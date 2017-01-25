function getIndicesOf(str, searchStr, caseSensitive=false) {
    var searchStrLen = searchStr.length;
    if (searchStrLen == 0) {
        return [];
    }
    var startIndex = 0, index, indices = [];
    if (!caseSensitive) {
        str = str.toLowerCase();
        searchStr = searchStr.toLowerCase();
    }
    while ((index = str.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStrLen;
    }
    return indices;
}

//An investigation of text summarizing methods.
//here we go over "TextRank", which is a text based analogue for page rank,
//with weighted edges and the same idea of connection and importance.

function sentenceSimilarity(text1, text2) {
  var tokens1 = text1.replace(/[^\w\s]/gi, '').split(" ");
  var tokens2 = text2.replace(/[^\w\s]/gi, '').split(" ");
  var matches = findMatchesInStringArrays(tokens1, tokens2, disregard=[prepositions]);
  return matches.length / (Math.log(tokens1.length) + Math.log(tokens2.length));
}

function createGraphFromSentences(listSentences, threshold=0.75) {
  var graph = [];
  for (var i = 0; i < listSentences.length; i++) {
    var node = {
      importance: 1.0,
      sentence: listSentences[i],
      neighbors: {}
    }
    for (var j = 0; j < listSentences.length; j++) {
      if (i === j) continue;
      var senSimil = sentenceSimilarity(listSentences[i], listSentences[j]);
      if (senSimil > threshold) {
        node.neighbors[j] = senSimil;
      }
      //node.neighbors[j] = senSimil > threshold ? senSimil : 0.125;
    }
    graph.push(node);
  }
  return graph;
}

function createGraphFromWords(text, coOccur=5) {
  var sentences = text.split(".");
  var words = [];
  var textSplit = [];
  for (var i = 0; i < sentences.length; i++) {
    sentences[i] = sentences[i].replace(/[^\w\s]/gi, "");
    var tokens = sentences[i].split(" ");
    for (var j = 0; j < tokens.length; j++) {
      if (words.indexOf(tokens[i]) === -1) {
        words.push(tokens[i]);
      }
      textSplit.push(tokens[i]);
    }
  }
  var graph = [];
  for (var i = 0; i < words.length; i++) {
    graph.push({
      word: words[i],
      importance: 1.0,
      neighbors: {}
    });
  }
  //Two words "co-occur" if they appear in within a window of N words or less
  for (var i = 0; i < words.length; i++) { //For every word
    var word = words[i];
    var indices = getIndicesOf(text, word); //Find every occurrence of this word
    for (var index = 0; index < indices.length; index++) {
      for (var j = index - coOccur; j < index + coOccur; j++) { //For every occurrence, look through its window indices[...] +- coOccur
        if (j < 0 || j >= words.length) continue;
        var wordFoundIndex = words.indexOf(words[j]);
        if (wordFoundIndex !== -1) {
          if (graph[i].neighbors[wordFoundIndex] === undefined) {
            graph[i].neighbors[wordFoundIndex] = 0;
            //graph[wordFoundIndex].neighbors[i] = 0;
          }
          graph[i].neighbors[wordFoundIndex]++;
          //graph[wordFoundIndex].neighbors[i]++;
        }
      }
    }
  }
  return graph;
}

function iterateTextrankGraph(graph, d=0.85) {
  var newImportances = [];
  for (var i = 0; i < graph.length; i++) {
    var nodeI = graph[i];

    var sum = 0;
    var nodeIAdj = Object.keys(nodeI.neighbors);
    for (var j = 0; j < nodeIAdj.length; j++) {
      var nodeJ = graph[nodeIAdj[j]];
      var weightIJ = nodeI.neighbors[nodeIAdj[j]];

      var nodeJAdj = Object.keys(nodeJ.neighbors);
      var jkSum = 0;
      for (var k = 0; k < nodeJAdj.length; k++) {
        var weightJK = nodeJ.neighbors[nodeJAdj[k]];
        jkSum += weightJK;
      }

      sum += weightIJ * nodeJ.importance / jkSum;
    }

    var newScore = (1-d) + d*sum;
    newImportances.push(newScore);
  }
  for (var i = 0; i < graph.length; i++) {
    graph[i].importance = newImportances[i];
  }
  return graph;
}

var sim = sentenceSimilarity("This is a sentence about water.", "Water is a word in this sentence.");
/*
var sentences = ["This is a sentence about water.", "Water is a word in this sentence.", "Water water water", "Really love to talk about sentences with water",
                 "This is a sentence about water is a word in this sentence and I really love to talk about sentences with water",
                 "Not really related to the subject at hand. Oops.",
                 "Prepositions for and not but or yet so"]
                 */

function summarizeText(text, numToSummarize=10, iterations=10) {
  var sentences = text.split(".");
  for (var i = 0; i < sentences.length; i++) {
    sentences[i] = sentences[i].replace(/[^\w\s]/gi, "");
  }
  var graph = createGraphFromSentences(sentences);
  for (var i = 0; i < iterations; i++) {
    iterateTextrankGraph(graph);
  }
  /*
  for (var i = 0; i < graph.length; i++) {
    console.log(graph[i]);
  }
  */
  graph.sort(function(a,b) {return b.importance - a.importance;});
  for (var i = 0; i < numToSummarize; i++) {
    console.log(graph[i]);
  }
}

function biasedSummarizeText(topic, text, numToSummarize=50) {

}














//A comment to hold the line.
