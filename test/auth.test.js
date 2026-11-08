const test = require('node:test');
const assert = require('node:assert/strict');
const TaiKhoan = require('../models/taikhoan');
const { requireAdmin, requireLogin } = require('../utils/auth');

function createResponse() {
    return {
        statusCode: 200,
        body: '',
        redirectPath: '',
        status(code) {
            this.statusCode = code;
            return this;
        },
        send(body) {
            this.body = body;
            return this;
        },
        redirect(path) {
            this.redirectPath = path;
            return this;
        }
    };
}

test('requires login before protected actions', () => {
    const req = { session: {} };
    const res = createResponse();
    let passed = false;

    requireLogin(req, res, () => {
        passed = true;
    });

    assert.equal(passed, false);
    assert.equal(res.redirectPath, '/dangnhap');
    assert.match(req.session.error, /đăng nhập/i);
});

test('requires admin role for admin routes', async t => {
    const originalFindById = TaiKhoan.findById;
    t.after(() => {
        TaiKhoan.findById = originalFindById;
    });

    const req = { session: { user: { _id: 'account-id' } } };
    const res = createResponse();
    let passed = false;
    TaiKhoan.findById = () => ({
        select: async () => ({ QuyenHan: '0', KichHoat: 1 })
    });

    await requireAdmin(req, res, () => {
        passed = true;
    });

    assert.equal(passed, false);
    assert.equal(res.statusCode, 403);
});

test('allows active admin accounts and refreshes the session role', async t => {
    const originalFindById = TaiKhoan.findById;
    t.after(() => {
        TaiKhoan.findById = originalFindById;
    });

    const req = { session: { user: { _id: 'account-id', QuyenHan: '0' } } };
    const res = createResponse();
    let passed = false;
    TaiKhoan.findById = () => ({
        select: async () => ({ QuyenHan: '1', KichHoat: 1 })
    });

    await requireAdmin(req, res, () => {
        passed = true;
    });

    assert.equal(passed, true);
    assert.equal(req.session.user.QuyenHan, '1');
});

test('rejects inactive accounts on admin routes', async t => {
    const originalFindById = TaiKhoan.findById;
    t.after(() => {
        TaiKhoan.findById = originalFindById;
    });

    const req = { session: { user: { _id: 'account-id' } } };
    const res = createResponse();
    TaiKhoan.findById = () => ({
        select: async () => ({ QuyenHan: '1', KichHoat: 0 })
    });

    await requireAdmin(req, res, () => {
        assert.fail('inactive account passed authorization');
    });

    assert.equal(res.statusCode, 401);
});
