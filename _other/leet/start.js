var binary_search = function(nums, target) {
	let i1=0,i2=nums.length-1;
	while(i2>=i1){
			let n=i2-i1+1;
			let m=i1+Math.floor(n/2);
			console.log('lower',i1,'upper',i2,'N',n,'middle',m,);
			if (target == nums[m]) return m;
			else if (target < nums[m]) i2=m-1;
			else i1=m+1;
	}
	return -1;
};

//let x = binary_search([-1,0,3,5,9,12],9); console.log('x',x);













