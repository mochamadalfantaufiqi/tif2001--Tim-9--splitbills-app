'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const authService = require('./auth.service');

const register = asyncHandler(async (req, res) => {
  const { user, token } = await authService.register(req.body);
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, token },
  });
});

const login = asyncHandler(async (req, res) => {
  const { user, token } = await authService.login(req.body);
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: { user, token },
  });
});

const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  res.status(200).json({
    success: true,
    message: 'Authenticated user fetched',
    data: { user },
  });
});

module.exports = { register, login, getMe };
