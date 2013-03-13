/*globals Stativus DEBUG_MODE EVENTABLE exports $ *//**
  This is the code for creating statecharts in your javascript files
  
  @author: Evin Grano
  @version: 0.6.1
*/Stativus={DEFAULT_TREE:"default",SUBSTATE_DELIM:"SUBSTATE:",version:"0.6.1"},Stativus.State={isState:!0,_data:null,_isNone:function(a){return a===undefined||a===null},goToState:function(a){var b=this.statechart;b&&b.goToState(a,this.globalConcurrentState,this.localConcurrentState)},goToHistoryState:function(a,b){var c=this.statechart;c&&c.goToHistoryState(a,this.globalConcurrentState,this.localConcurrentState,b)},sendEvent:function(a){var b=this.statechart;b&&b.sendEvent.apply(b,arguments)},getData:function(a){if(this._isNone(a))return a;var b=this.statechart,c=this._data[a];return this._isNone(c)&&(c=b.getData(a,this.parentState,this.globalConcurrentState)),c},setData:function(a,b){if(this._isNone(a))return b;this._data[a]=b},setHistoryState:function(a){this.history=this.history||{},this.substatesAreConcurrent?this.history[this.localConcurrentState]=a.name:this.history=a.name}},Stativus.State.create=function(a){function g(){}var b,c,d,e,f;a=a||[],g.prototype=this,b=new g,b._data={};for(e=0,f=a.length||0;e<f;e++){d=a[e];if(typeof d=="object")for(c in d)d.hasOwnProperty(c)&&(b[c]=d[c])}return b},Stativus.Statechart={isStatechart:!0,create:function(a){function c(){}var b;return c.prototype=this,b=new c,b._all_states={},b._all_states[Stativus.DEFAULT_TREE]={},b._states_with_concurrent_substates={},b._current_subtrees={},b._current_state={},b._current_state[Stativus.DEFAULT_TREE]=null,b._goToStateLocked=!1,b._sendEventLocked=!1,b._pendingStateTransitions=[],b._pendingEvents=[],b._active_subtrees={},b},addState:function(a){var b,c,d=!1,e,f,g,h,i,j=[],k,l,m=this;for(l=1,k=arguments.length;l<k;l++)j[l-1]=i=arguments[l],d=d||!!i.substatesAreConcurrent,e=e||i.parentState;return k===1&&(j[0]=i={}),i.name=a,i.statechart=this,i.history=null,b=i.globalConcurrentState||Stativus.DEFAULT_TREE,i.globalConcurrentState=b,g=this._states_with_concurrent_substates[b],d&&(c=this._states_with_concurrent_substates[b]||{},c[a]=!0,this._states_with_concurrent_substates[b]=c),e&&g&&g[e]&&(e=this._all_states[b][e],e&&(e.substates=e.substates||[],e.substates.push(a))),h=Stativus.State.create(j),h.sendAction=h.sendEvent,c=this._all_states[b],c||(c={}),c[a]=h,this._all_states[b]=c,h._beenAdded=!0,f=h.states||[],f.forEach(function(c,d){var e=[],f=!1,g;typeof c=="object"&&c.length>0?(e=e.concat(c),f=!0):typeof c=="string"?(e.push(c),f=!0):typeof c=="object"&&(typeof c.name=="string",e.push(c.name),e.push(c),f=!0),f&&(g=e.length-1,e[g].parentState=a,e[g].globalConcurrentState=b,m.addState.apply(m,e))}),this},initStates:function(a){var b,c;this._inInitialSetup=!0;if(typeof a=="string")this.goToState(a,Stativus.DEFAULT_TREE);else if(typeof a=="object")for(b in a)a.hasOwnProperty(b)&&(c=a[b],this.goToState(c,b));return this._inInitialSetup=!1,this._flushPendingEvents(),this},goToState:function(a,b,c){var d,e=this._all_states[b],f,g,h=[],i=[],j,k,l,m,n,o,p,q,r,s,t;d=c?this._current_state[c]:this._current_state[b],n=e[a];if(this._checkAllCurrentStates(n,c||b))return;if(this._goToStateLocked){this._pendingStateTransitions.push({requestedState:a,tree:b});return}this._goToStateLocked=!0,h=this._parentStatesWithRoot(n),i=d?this._parentStatesWithRoot(d):[],k=-1;for(f=0,g=i.length;f<g;f++){l=f,k=h.indexOf(i[f]);if(k>=0)break}k<0&&(k=h.length-1),this._enterStates=h,this._enterStateMatchIndex=k,this._enterStateConcurrentTree=c,this._enterStateTree=b,this._exitStateStack=[],d&&d.substatesAreConcurrent&&this._fullExitFromSubstates(b,d);for(p=0;p<l;p+=1)d=i[p],this._exitStateStack.push(d);this._unwindExitStateStack()},goToHistoryState:function(a,b,c,d){var e=this._all_states[b],f,g;f=e[a],f&&(g=f.history||f.initialSubstate);if(!g)g=a;else if(d){this.goToHistoryState(g,b,d);return}this.goToState(g,b)},currentState:function(a){var b,c,d,e,f,g=this._current_state,h,i,j,k,l,m;a=a||"default",h=g[a],m=this._all_states[a],h&&h.isState&&(b=this._parentStates(h));if(h&&h.substatesAreConcurrent){e=this._active_subtrees[a]||[];for(i=0,j=e.length;i<j;i++)d=e[i],k=g[d],k&&(l=m[k.parentState]),l&&b.indexOf(l)<0&&b.unshift(l),k&&b.indexOf(k)<0&&b.unshift(k)}return b},sendEvent:function(a){var b=[],c=arguments.length,d;if(c<1)return;for(d=1;d<c;d++)b[d-1]=arguments[d];try{if(this._inInitialSetup||this._sendEventLocked||this._goToStateLocked){this._pendingEvents.push({evt:a,args:b});return}this._sendEventLocked=!0,this._structureCrawl("_cascadeEvents",a,b)}catch(e){throw this._restartEvents(),e}this._restartEvents()},getData:function(a,b,c){var d=this._all_states[c],e;if(!d)return null;e=d[b];if(e&&e.isState)return e.getData(a)},getState:function(a,b){var c,d;return b=b||Stativus.DEFAULT_TREE,c=this._all_states[b],c?(d=c[a],d):null},_restartEvents:function(){this._sendEventLocked=!1,this._inInitialSetup||this._flushPendingEvents()},_structureCrawl:function(a,b,c){var d,e=this._current_state,f,g,h,i,j,k,l,m,n,o,p=Stativus.SUBSTATE_DELIM;for(d in e){if(!e.hasOwnProperty(d))continue;n=!1,m=null,k=e[d];if(!k||d.slice(0,p.length)===p)continue;j=this._all_states[d];if(!j)continue;l=this._active_subtrees[d]||[];for(f=0,g=l.length;f<g;f++)m=l[f],h=e[m],i=n?[!0,!0]:this[a](b,c,h,j,m),n=i[0];n||(i=this[a](b,c,k,j,null),n=i[0])}},_cascadeEvents:function(a,b,c,d,e){var f,g,h,i,j=!1;e&&(g=e.split("=>"),h=g.length||0,i=g[h-1]);while(!f&&c){c[a]&&(f=c[a].apply(c,b),j=!0);if(e&&i===c.name)return[f,j];c=!f&&c.parentState?d[c.parentState]:null}return[f,j]},_checkAllCurrentStates:function(a,b){var c=this.currentState(b)||[];return c===a?!0:typeof c=="string"&&a===this._all_states[b][c]?!0:c.indexOf&&c.indexOf(a)>-1?!0:!1},_flushPendingEvents:function(){var a,b=this._pendingEvents.shift();if(!b)return;a=b.args,a.unshift(b.evt),this.sendEvent.apply(this,a)},_flushPendingStateTransitions:function(){var a=this._pendingStateTransitions.shift(),b;return a?(this.goToState(a.requestedState,a.tree),!0):!1},_parentStateObject:function(a,b){if(a&&b&&this._all_states[b]&&this._all_states[b][a])return this._all_states[b][a]},_fullEnter:function(a){var b,c=!1;if(!a)return;a.enterState&&a.enterState(),a.didEnterState&&a.didEnterState(),a.parentState&&(b=a.statechart.getState(a.parentState,a.globalConcurrentState),b.setHistoryState(a)),this._unwindEnterStateStack()},_fullExit:function(a){var b;if(!a)return;var c=!1;a.exitState&&a.exitState(),a.didExitState&&a.didExitState(),this._unwindExitStateStack()},_initiateEnterStateSequence:function(){var a,b,c,d,e,f,g;a=this._enterStates,b=this._enterStateMatchIndex,c=this._enterStateConcurrentTree,d=this._enterStateTree,e=this._all_states[d],this._enterStateStack=this._enterStateStack||[],f=b-1,g=a[f],g&&this._cascadeEnterSubstates(g,a,f-1,c||d,e),this._unwindEnterStateStack(),a=null,b=null,c=null,d=null,delete this._enterStates,delete this._enterStateMatchIndex,delete this._enterStateConcurrentTree,delete this._enterStateTree},_cascadeEnterSubstates:function(a,b,c,d,e){var f,g=b.length,h,i,j=this,k,l,m,n,o,p;if(!a)return;m=a.name,this._enterStateStack.push(a),this._current_state[d]=a,a.localConcurrentState=d;if(a.substatesAreConcurrent){d=a.globalConcurrentState||Stativus.DEFAULT_TREE,p=[Stativus.SUBSTATE_DELIM,d,m].join("=>"),a.history=a.history||{},i=a.substates||[],i.forEach(function(a){k=p+"=>"+a,f=e[a],l=f.globalConcurrentState||Stativus.DEFAULT_TREE,o=j._active_subtrees[l]||[],o.unshift(k),j._active_subtrees[l]=o,c>-1&&b[c]===f&&(c-=1),j._cascadeEnterSubstates(f,b,c,k,e)});return}f=b[c],f?(c>-1&&b[c]===f&&(c-=1),this._cascadeEnterSubstates(f,b,c,d,e)):(f=e[a.initialSubstate],this._cascadeEnterSubstates(f,b,c,d,e))},_fullExitFromSubstates:function(a,b){var c,d,e,f=this;if(!a||!b||!a||!b.substates)return;d=this._all_states[a],c=this._current_state,this._exitStateStack=this._exitStateStack||[],b.substates.forEach(function(e){var g,h,i,j,k;g=[Stativus.SUBSTATE_DELIM,a,b.name,e].join("=>"),h=c[g];while(h&&h!==b){j=!1;if(!h)continue;f._exitStateStack.unshift(h),h.substatesAreConcurrent&&f._fullExitFromSubstates(a,h),i=h.parentState,h=d[i]}f._active_subtrees[a]=f._removeFromActiveTree(a,g)})},_unwindExitStateStack:function(){var a,b=!1,c;this._exitStateStack=this._exitStateStack||[],a=this._exitStateStack.shift(),a?(a.willExitState&&(c={_statechart:this,_start:a,restart:function(){var a=this._statechart;a&&a._fullExit(this._start)}},b=a.willExitState(c)),b||this._fullExit(a)):(delete this._exitStateStack,this._initiateEnterStateSequence())},_unwindEnterStateStack:function(){var a,b=!1,c,d;this._exitStateStack=this._exitStateStack||[],a=this._enterStateStack.shift(),a?(a.willEnterState&&(c={_statechart:this,_start:a,restart:function(){var a=this._statechart;a&&a._fullEnter(this._start)}},b=a.willEnterState(c)),b||this._fullEnter(a)):(delete this._enterStateStack,this._goToStateLocked=!1,d=this._flushPendingStateTransitions(),!d&&!this._inInitialSetup&&this._flushPendingEvents())},_removeFromActiveTree:function(a,b){var c=[],d=this._active_subtrees[a];return d?b?(d.forEach(function(a){a!==b&&c.push(a)}),c):d:[]},_parentStates:function(a){var b=[],c=a;b.push(c),c=this._parentStateObject(c.parentState,c.globalConcurrentState);while(c)b.push(c),c=this._parentStateObject(c.parentState,c.globalConcurrentState);return b},_parentStatesWithRoot:function(a){var b=this._parentStates(a);return b.push("root"),b}},Stativus.createStatechart=function(){return this.Statechart.create()},Stativus.Statechart._internalTryToPerform=function(a,b,c){var d=this,e,f;if(!a||!a.className)return;f=a.className.split(/\s+/).map(function(a){return"."+a}),a.id&&f.push("#"+a.id),f.forEach(function(a){e=(a+" "+b).replace(/^\s\s*/,"").replace(/\s\s*$/,""),d._structureCrawl("_cascadeActionHandler",e,c)})},Stativus.Statechart._cascadeActionHandler=function(a,b,c,d,e){var f,g,h,i,j=!1,k;e&&(g=e.split("=>"),h=g.length||0,i=g[h-1]);while(!f&&c){k=c.actions?c.actions[a]:null;if(k)return b.unshift(k),this.sendEvent.apply(this,b),[!0,!0];if(e&&i===c.name)return[f,j];c=!f&&c.parentState?d[c.parentState]:null}return[f,j]};var jQueryIsLoaded=!1;try{jQuery&&(jQueryIsLoaded=!0)}catch(err){jQueryIsLoaded=!1}if(jQueryIsLoaded){var findEventableNodeData=function(a){var b,c,d,e,f=$(a),g,h;return f.hasClass("eventable")&&(g=f),g||(b=f.parents(".eventable"),b&&b.length>0&&(g=b)),g&&(e=g.attr("data"),e=e?e.split("::"):[],g=g[0]),[g,e]};Stativus.Statechart.tryToPerform=function(a){if(!a)return;var b,c=[],d=findEventableNodeData(a.target);if(!d[0])return;d[1].push(a),this._internalTryToPerform(d[0],a.type,d[1])}}else Stativus.Statechart.tryToPerform=function(a){if(!a)return;var b=[],c=arguments.length,d,e;if(c<2)return;for(d=2;d<c;d++)b[d-2]=arguments[d];b.push(a),this._internalTryToPerform(a.target,a.type,b)};typeof window!="undefined"?window.Stativus=Stativus:typeof exports!="undefined"&&(module.exports=Stativus);