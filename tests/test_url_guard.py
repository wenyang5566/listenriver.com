"""Regression cases for the migration guard; no Hugo/network required."""
import copy
import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location('url_guard', Path(__file__).parents[1] / 'scripts/url-guard.py')
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)


class UrlGuardTests(unittest.TestCase):
    def setUp(self):
        self.old = {'pages': {
            '/文章/': {'canonical': '/文章/', 'redirect': None},
            '/legacy/': {'canonical': '/文章/', 'redirect': '/文章/'},
            '/tags/topic/index.xml': {'canonical': None, 'redirect': None},
        }, 'redirect_rules': []}

    def test_unchanged(self):
        self.assertEqual(guard.check(self.old, self.old, {})[0], [])

    def test_missing_article_and_feed(self):
        new = copy.deepcopy(self.old)
        del new['pages']['/文章/']
        del new['pages']['/tags/topic/index.xml']
        self.assertEqual(len(guard.check(self.old, new, {})[0]), 3)

    def test_redirect_loop(self):
        new = copy.deepcopy(self.old)
        new['pages']['/文章/']['redirect'] = '/legacy/'
        self.assertTrue(guard.check(self.old, new, {})[0])

    def test_wrong_destination_even_when_page_exists(self):
        new = copy.deepcopy(self.old)
        new['pages']['/other/'] = {'canonical': '/other/', 'redirect': None}
        new['pages']['/legacy/']['redirect'] = '/other/'
        self.assertTrue(guard.check(self.old, new, {})[0])

    def test_reviewed_move_covers_legacy_alias(self):
        new = copy.deepcopy(self.old)
        new['pages']['/new/'] = {'canonical': '/new/', 'redirect': None}
        del new['pages']['/文章/']
        new['redirect_rules'] = ['/文章/ /new/ 301']
        self.assertEqual(guard.check(self.old, new, {'/文章/': '/new/'})[0], [])
        self.assertTrue(guard.check(self.old, new, {})[0])

    def test_exact_redirect_source_is_checked(self):
        self.old['redirect_rules'] = ['/external-old/ /文章/ 301']
        new = copy.deepcopy(self.old)
        new['redirect_rules'].insert(0, '/external-old/ /missing/ 301')
        self.assertTrue(guard.check(self.old, new, {})[0])

    def test_encoding(self):
        self.assertEqual(guard.route('https://listenriver.com/%E6%96%87%E7%AB%A0/'), '/文章/')


if __name__ == '__main__':
    unittest.main()
