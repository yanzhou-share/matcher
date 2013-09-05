var TmUserMatcher = TmUserMatcher || (function() {
	
	/*
	 * user={
	 * 	pystr:拼音字符串 string
	 *  prehits: 命中串 array
	 *  score: 得分 ,float
	 *  uid: 用户uid string
	 *  name: 用户名 string
	 *  spellingName: 拼音分割串数组 array
	 * };
	 */
	
	var _this={};
	
	/**
	 * 加载用户通讯录
	 */
	_this.load_contact = function(txl_list){
		_this.txl = txl_list;
	};
	
    function getType(o) 
    {
        var _t;
        return ((_t = typeof(o)) == "object" ? Object.prototype.toString.call(o).slice(8,-1):_t).toLowerCase();
    }
	
	/**
	 * 匹配前缀输入
	 */
	_this.match = function(prefix,highlight){
		prefix = prefix.toLowerCase();
		var _subusers = _this.txl;
		if(_this.lastprefix&&prefix.indexOf(_this.lastprefix)==0){
			_subusers = _this.lastmatch;
		}
		
		var _match_array = [], sl = _subusers.length;
		
		for(var i=0; i<sl; ++i)
		{
			var user = _subusers[i];
			if(user)
			{
				var _ismatch = update_hit(user, prefix);
		        if(_ismatch){
		            _match_array.push(user);
		        }
			}
		}
		
		_this.lastprefix = prefix;
		_this.lastmatch = _match_array;
		
		_match_array.sort(sort_match);
		
		return _match_array;
		
	};
	
	function sort_match(u1,u2){
		var s = u2.score - u1.score;
		if(s!=0){
			return s;
		}
		
		if(u2.initialsName > u1.initialsName){
			return -1;
		}else if(u2.initialsName < u1.initialsName){
			return 1;
		}
		
		if(u2.phoneNum > u1.phoneNum){
			return -1;
		}else if(u2.phoneNum < u1.phoneNum){
			return 1;
		}
		
		return 0;
		
	}
	
	function calculateScore(user){
		if(user.prehits==null){
			user.score=0;
			return;
		}
		var sc=0;
		var ma_num=0;
		for(var i=0;i<user.prehits.length;i++){
			if(user.prehits[i]!=null){
				sc += (user.prehits[i].length/user.spellingName[i].length)/(i+1);
				ma_num++;
			}
		}
		//Math.sqrt
		var factor = ma_num/user.nickName.length;//有英文问题
		user.score = sc*factor;
//		/Math.sqrt(user.name.length);
	}
	
	function update_hit(user,prefix){
		var pre_match=-1;//上个匹配单词
		var crt_word=-1;//当前匹配单词
		var startoffset=0;//prefix串扫描位置
		var match=false;//是否匹配prefix
		var hits = [];
		for(var i=0;i< prefix.length;i++){
			var _pre = prefix.substring(startoffset,i+1);
			var mpos = -1;
			if(pre_match<0){//第一次匹配
				var sj=0;
				if(crt_word>=0){
					sj = crt_word;
				}
				for(var j=sj;j<user.spellingName.length;j++){
					if(user.spellingName[j].indexOf(_pre)==0){
						mpos = j;
						break;
					}else if(crt_word >=0){
						break;
					}
				}
			}else if((pre_match < user.spellingName.length-1) && 
					user.spellingName[pre_match+1].indexOf(_pre)==0){//后续单词前缀匹配
				mpos = pre_match + 1;
			}else if(_pre.length==1){
				break;
			}

			if(mpos >= 0){
				hits[mpos] = _pre;
				crt_word = mpos;
			}else if(i==0){//第一个字符不匹配
				break;
			}else if(pre_match<0||pre_match+1==crt_word){//偏移至下一个词
				startoffset = i;
				i--;
				pre_match = crt_word;
			}else{
				break;
			}
			if(i==prefix.length-1){
				match = true;
			}
		}
		if(match){
			user.prehits = hits;
			calculateScore(user);
		}else{
			user.prehits = null;
			user.score = 0;
		}
		return match;		
	}
	
	return _this;
	
})();
