function quicksort_vis() {
  var n = 20,
    array = d3.shuffle(d3.range(n));

  var margin = { top: 60, right: 60, bottom: 60, left: 60 },
    width = window.innerWidth - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

  var x = d3.scale
    .ordinal()
    .domain(d3.range(n))
    .rangePoints([0, width - 120]);

  var p = d3.select("#quicksort_vis").on("click", click);

  var svg = p
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(50, 15)");
  var gCircle = svg.append("g").attr("class", "circle");

  gCircle
    .selectAll("circle")
    .data(array)
    .enter()
    .append("circle")
    .attr("cy", height)
    .attr("cx", function (d, i) {
      return x(i) + 12;
    })
    .attr("r", 25);

  var gText = svg.append("g").attr("class", "text");

  gText
    .selectAll(".text")
    .data(array)
    .enter()
    .append("text")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dominant-baseline", "central")
    .attr("transform", transform)
    .text((d) => {
      return d < 9 ? "0" + (d + 1) : d + 1;
    });

  p.append("button").text("▶ Play");

  function click() {
    var actions = quicksort(array.slice()).reverse();

    var text = gText
      .selectAll("text")
      .attr("transform", transform)
      .attr("class", "text--inactive")
      .interrupt();

    var circle = gCircle
      .selectAll("circle")
      .attr("class", "circle--inactive")
      .interrupt();

    var transition = svg
      .transition()
      .duration(500)
      .each("start", function start() {
        var action = actions.pop();

        var msgbox = d3.select("#quicksort_msg");

        switch (action.type) {
          case "swap": {
            if (action[2] == "start pivot") {
              msgbox.text("Move pivot to the end of partition");
            } else if (action[2] == "end pivot") {
              msgbox.text(
                text[0][action[0]].textContent +
                  " is higher than pivot and " +
                  text[0][action[1]].textContent +
                  " -> swap"
              );
            } else {
              msgbox.text(
                text[0][action[1]].textContent +
                  " is higher than pivot and " +
                  text[0][action[0]].textContent +
                  " -> swap"
              );
            }

            var i = action[0],
              j = action[1],
              li = text[0][i],
              lj = text[0][j];
            text[0][i] = lj;
            text[0][j] = li;

            transition.each(function () {
              text.transition().attr("transform", transform);
              circle.transition().attr("transform", set_colors);
            });

            function set_colors() {
              if (text[0][j].className.baseVal == "text--active") {
                circle.attr("class", function (d, k) {
                  return k === j
                    ? "circle--active"
                    : k === i
                    ? "circle--inactive"
                    : circle[0][k].className.baseVal;
                });
              }

              if (text[0][j].className.baseVal == "text--inactive") {
                circle.attr("class", function (d, k) {
                  return (k === j) | (k === i)
                    ? "circle--compare"
                    : text[0][k].className.baseVal === "text--inactive"
                    ? "circle--inactive"
                    : circle[0][k].className.baseVal;
                });
              }
            }

            break;
          }
          case "partition": {
            msgbox.text(
              "Current partition -> pivot " +
                text[0][action.pivot].textContent +
                "; segment: {" +
                action.left +
                ", " +
                action.right +
                "}"
            );
            text.attr("class", function (d, i) {
              return i === action.pivot
                ? "text--active"
                : action.left <= i && i < action.right
                ? "text--inactive"
                : null;
            });
            circle.attr("class", function (d, i) {
              return i === action.pivot
                ? "circle--active"
                : action.left <= i && i < action.right
                ? "circle--inactive"
                : null;
            });
            break;
          }
        }
        if (actions.length)
          transition = transition.transition().each("start", start);
        else
          transition.each("end", function () {
            text.attr("class", "text--inactive");
            circle.attr("class", "circle--inactive");
            msgbox.text("Done!");
          });
      });
  }

  function transform(d, i) {
    return "translate(" + x(i) + "," + height + ")";
  }

  function quicksort(array) {
    var actions = [];

    function partition(left, right, pivot) {
      var v = array[pivot];
      swap(pivot, --right, "start pivot");
      for (var i = left; i < right; ++i)
        if (array[i] < v) swap(i, left++, "compare");
      swap(left, right, "end pivot");
      return left;
    }

    function swap(i, j, k) {
      if (i === j) return;
      var t = array[i];
      array[i] = array[j];
      array[j] = t;
      actions.push({ type: "swap", 0: i, 1: j, 2: k });
    }

    function recurse(left, right) {
      if (left < right - 1) {
        var pivot = (left + right) >> 1;
        actions.push({
          type: "partition",
          left: left,
          pivot: pivot,
          right: right,
        });
        pivot = partition(left, right, pivot);
        recurse(left, pivot);
        recurse(pivot + 1, right);
      }
    }

    recurse(0, array.length);
    return actions;
  }
}

function mergeSort() {
  var n = 20,
    array = d3.shuffle(d3.range(n));

  var margin = { top: 60, right: 60, bottom: 60, left: 60 },
    width = window.innerWidth - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

  var x = d3.scale
    .ordinal()
    .domain(d3.range(n))
    .rangePoints([0, width - 120]);

  var a = d3.scale
    .linear()
    .domain([0, n - 1])
    .range([-45, 45]);

  var p = d3.select("#mergesort_vis").on("click", click);

  var svg = p
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height * 2 + margin.top + margin.bottom)
    .append("g")
    .attr(
      "transform",
      "translate(" + margin.left + "," + (margin.top + height) + ")"
    );

  var gCircle1 = svg.append("g").attr("class", "circle");

  gCircle1
    .selectAll("circle")
    .data([...array, ...array])
    .enter()
    .append("circle")
    .attr("cy", function (d, i) {
      return (i + 1) % 2 == 0 ? height : height - 75;
    })
    .attr("cx", function (d, i) {
      return x(Math.floor(i / 2)) + 12;
    })
    .attr("r", 25);

  var gText = svg.append("g").attr("class", "text");

  gText
    .selectAll(".text")
    .data(
      array.map(function (v, i) {
        return {
          value: v,
          index: i,
          array: 0,
        };
      })
    )
    .enter()
    .append("text")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dominant-baseline", "central")
    .attr("transform", transform)
    .text((d) => {
      return d.value < 9 ? "0" + (d.value + 1) : d.value + 1;
    });

  p.append("button").text("▶ Play");

  function click() {
    var text = gText
      .selectAll("text")
      .each(function (d, i) {
        d.array = 0;
        d.index = i;
      })
      .attr("transform", transform)
      .attr("class", "text--inactive")
      .interrupt();

    var circle = gCircle1
      .selectAll("circle")

      .attr("class", "circle--inactive")
      .interrupt();

    var text0 = text[0],
      text1 = new Array(n);

    var actions = mergesort(array.slice()).reverse();
    var msgbox = d3.select("#mergesort_msg");
    var cnt = 2;
    var gLine = svg.append("g").attr("class", "line");

    (function nextTransition() {
      var action = actions.pop();

      if (actions.length == 0) {
        msgbox.text("Done!");
        d3.selectAll("line").remove();
        gCircle1.selectAll("circle").each(function (d, i) {
          if (i % 2 == 1) {
            d3.select(this)
              .classed("circle--inactive", false)
              .style("fill", "#fefefe")
              .style("opacity", "20%");
          }
        });
      } else {
        gCircle1.selectAll("circle").each(function (d, i) {
          if (i % 2 == 1) {
            d3.select(this)
              .classed("circle--inactive", true)
              .style("fill", "#48c2c5")
              .style("opacity", "100%");
          }
        });
      }
      switch (action.type) {
        case "copy": {
          var counter_array = Array.from(Array(20).keys()).filter(
            (a) => a % cnt == 0
          );

          let update = gLine.selectAll("line").data(counter_array);

          update
            .enter()
            .append("line")
            .attr("class", "line--divider")
            .attr("y1", -2.5 * height)
            .attr("y2", 2 * height);

          update
            .attr("x1", function (d, i) {
              return x(i) * cnt - 17;
            })
            .attr("x2", function (d, i) {
              return x(i) * cnt - 17;
            });

          update.exit().remove();

          var i = action[0],
            j = action[1],
            e = (text1[j] = text0[i]),
            d = e.__data__;
          msgbox.text(
            "sorting partition of {" +
              cnt +
              "} numbers: new array postion " +
              (action[1] + 1) +
              " = " +
              text0[action[0]].textContent
          );
          d.index = j;
          d.array = (d.array + 1) & 1;
          d3.select(e)
            .transition()
            .duration(250)
            .attr("transform", transform)
            .each("end", actions.length ? nextTransition : null);
          break;
        }
        case "swap": {
          cnt += cnt;
          var t = text0;
          text0 = text1;
          text1 = t;
          if (actions.length) nextTransition();
          break;
        }
      }
    })();
  }

  function transform(d) {
    return "translate(" + x(d.index) + "," + (1 - d.array * 2.5) * height + ")";
  }

  function mergesort(array) {
    var actions = [],
      n = array.length,
      array0 = array,
      array1 = new Array(n);

    for (var m = 1; m < n; m <<= 1) {
      for (var i = 0; i < n; i += m << 1) {
        merge(i, Math.min(i + m, n), Math.min(i + (m << 1), n));
      }

      actions.push({ type: "swap" });
      (array = array0), (array0 = array1), (array1 = array);
    }

    function merge(left, right, end) {
      for (var i0 = left, i1 = right, j = left; j < end; ++j) {
        if (i0 < right && (i1 >= end || array0[i0] <= array0[i1])) {
          array1[j] = array0[i0];
          actions.push({ type: "copy", 0: i0++, 1: j });
        } else {
          array1[j] = array0[i1];
          actions.push({ type: "copy", 0: i1++, 1: j });
        }
      }
    }

    return actions;
  }
}

function insertionSort() {
  var n = 20,
    array = d3.shuffle(d3.range(n));

  var margin = { top: 60, right: 60, bottom: 60, left: 60 },
    width = window.innerWidth - margin.left - margin.right,
    height = 150 - margin.top - margin.bottom;

  var x = d3.scale
    .ordinal()
    .domain(d3.range(n))
    .rangePoints([0, width - 120]);

  var p = d3.select("#insertionsort_vis").on("click", click);

  var svg = p
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(50, 15)");
  var gCircle = svg.append("g").attr("class", "circle");

  gCircle
    .selectAll("circle")
    .data(array)
    .enter()
    .append("circle")
    .attr("cy", height)
    .attr("cx", function (d, i) {
      return x(i) + 12;
    })
    .attr("r", 25);

  var gText = svg.append("g").attr("class", "text");

  gText
    .selectAll(".text")
    .data(array)
    .enter()
    .append("text")
    .attr("y", 0)
    .attr("x", 0)
    .attr("dominant-baseline", "central")
    .attr("transform", transform)
    .text((d) => {
      return d < 9 ? "0" + (d + 1) : d + 1;
    });

  p.append("button").text("▶ Play");

  function click() {
    var actions = insertionSort(array.slice()).reverse();

    var text = gText
      .selectAll("text")
      .attr("transform", transform)
      .attr("class", "text--inactive")
      .interrupt();

    var circle = gCircle.selectAll("circle").interrupt();

    var transition = svg
      .transition()
      .duration(500)
      .each("start", function start() {
        var action = actions.pop();

        var msgbox = d3.select("#insertionsort_msg");

        switch (action.type) {
          case "swap": {
            msgbox.text(
              text[0][action[0]].textContent +
                " is less than " +
                text[0][action[1]].textContent +
                " -> insert"
            );
            var i = action[0],
              j = action[1],
              li = text[0][i],
              lj = text[0][j];
            text[0][i] = lj;
            text[0][j] = li;

            transition.each(function () {
              text.transition().attr("transform", transform);
              circle.transition().attr("transform", set_colors);
            });

            function set_colors() {
              if (text[0][j].className.baseVal == "text--active") {
                circle.attr("class", function (d, k) {
                  return k === j
                    ? "circle--active"
                    : k === i
                    ? "circle--inactive"
                    : circle[0][k].className.baseVal;
                });
              }

              if (text[0][j].className.baseVal == "text--inactive") {
                circle.attr("class", function (d, k) {
                  return (k === j) | (k === i)
                    ? "circle--compare"
                    : text[0][k].className.baseVal === "text--inactive"
                    ? "circle--inactive"
                    : circle[0][k].className.baseVal;
                });
              }
            }

            break;
          }
          case "scanning": {
            msgbox.text(
              "Next value to sort: " + text[0][action.end].textContent
            );
            text.attr("class", function (d, i) {
              return i === action.end
                ? "text--active"
                : action.start <= i && i < action.end
                ? "text--inactive"
                : null;
            });
            circle.attr("class", function (d, i) {
              return i === action.end
                ? "circle--active"
                : action.start <= i && i < action.end
                ? "circle--inactive"
                : null;
            });
            break;
          }
        }
        if (actions.length)
          transition = transition.transition().each("start", start);
        else
          transition.each("end", function () {
            text.attr("class", "text--inactive");
            circle.attr("class", "circle--inactive");
            msgbox.text("Done!");
          });
      });
  }

  function transform(d, i) {
    return "translate(" + x(i) + "," + height + ")";
  }

  function insertionSort(array) {
    var actions = [];
    let i, key, j;
    function swap(i, j) {
      if (i === j) return;
      var t = array[i];
      array[i] = array[j];
      array[j] = t;
      actions.push({ type: "swap", 0: i, 1: j });
    }

    for (i = 1; i < n; i++) {
      key = array[i];

      actions.push({ type: "scanning", start: 0, end: i });
      j = i - 1;

      while (j >= 0 && array[j] > key) {
        swap(j + 1, j);
        j = j - 1;
      }
      array[j + 1] = key;
    }

    return actions;
  }
}
