import childProcess from 'child_process';
import test from 'ava';

test.cb('--download', t => {
	const cp = childProcess.spawn('./cli.js', ['-d', 'https://www.instagram.com/p/Bl5WTawF_Ym/?taken-by=9gag'], {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 0);
		t.end();
	});
});

test.cb('--export', t => {
	const cp = childProcess.spawn('./cli.js', ['-e', 'https://www.instagram.com/p/BlZb_giFuwc/?taken-by=9gag'], {stdio: 'inherit'});

	cp.on('error', t.ifError);

	cp.on('close', code => {
		t.is(code, 1);
		t.end();
	});
});
